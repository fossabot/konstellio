import { FileSystem, Stats } from '../FileSystem';
import { Pool } from '@konstellio/promised';
import * as FTPClient from 'ftp';
import { Duplex, Readable, Writable, Transform } from 'stream';
import { join, dirname, basename, sep } from 'path';
import { ConnectionOptions } from 'tls';
import { FileNotFound, OperationNotSupported, FileAlreadyExists, CouldNotConnect } from '../Errors';

function normalizePath(path: string) {
	path = path.split(sep).join('/').trim();
	while (path.startsWith('/')) {
		path = path.substr(1);
	}
	while (path.endsWith('/')) {
		path = path.substr(0, path.length - 1);
	}
	if (path.startsWith('/') === false) {
		path = '/' + path;
	}
	return path;
}

export enum FTPConnectionState {
	Disconnecting,
	Closed,
	Connecting,
	Ready
}

export interface FTPFileSystemOptions {
	host?: string;
	port?: number;
	secure?: string | boolean;
	secureOptions?: ConnectionOptions;
	user?: string;
	password?: string;
	connTimeout?: number;
	pasvTimeout?: number;
	keepalive?: number;
	debug?: (msg: string) => void
}

export class FTPFileSystem extends FileSystem {

	private disposed: boolean;
	private connection?: FTPClient;
	private connectionState: FTPConnectionState;
	private pool: Pool;

	constructor(
		private readonly options: FTPFileSystemOptions
	) {
		super();
		this.disposed = false;
		this.connectionState = FTPConnectionState.Closed;
		this.pool = new Pool([{}]);
	}

	clone() {
		return new FTPFileSystem(this.options);
	}

	protected getConnection(): Promise<FTPClient> {
		return new Promise((resolve, reject) => {
			if (this.connectionState === FTPConnectionState.Disconnecting) {
				return reject(new Error(`Filesystem is currently disconnecting.`));
			}
			else if (this.connectionState === FTPConnectionState.Ready) {
				return resolve(this.connection!);
			}
			else if (this.connectionState === FTPConnectionState.Closed) {
				this.connection = new FTPClient();
				this.connection.on('end', () => {
					this.connectionState = FTPConnectionState.Closed;
				});
				this.connection.on('ready', () => {
					this.connectionState = FTPConnectionState.Ready;
				});
			}

			const onReady = () => {
				this.connection!.removeListener('error', onError);
				resolve(this.connection!);
			};
			const onError = (err) => {
				this.connection!.removeListener('ready', onReady);
				reject(new CouldNotConnect(err));
			}

			this.connection!.once('ready', onReady);
			this.connection!.once('error', onError);
			
			if (this.connectionState !== FTPConnectionState.Connecting) {
				this.connectionState = FTPConnectionState.Connecting;
				this.connection!.connect(this.options);
			}
		});
	}

	isDisposed(): boolean {
		return this.disposed;
	}

	async disposeAsync(): Promise<void> {
		if (this.disposed === false) {
			this.disposed = true;
			this.connectionState = FTPConnectionState.Disconnecting;
			if (this.connection) {
				this.connection.destroy();
				(this as any).connection = undefined;
			}
			this.pool.dispose();
			(this as any).queue = undefined;
			(this as any).queueMap = undefined;
			(this as any).pool = undefined;
		}
	}

	async stat(path: string): Promise<Stats> {
		const normalized = normalizePath(path);
		if (normalized === '/') {
			return new Stats(false, true, false, 0, new Date(), new Date(), new Date());
		}
		const filename = basename(normalized);
		const entries = await this.readDirectory(dirname(normalized), true);
		const entry = entries.find(([name]) => name === filename);
		if (entry) {
			return entry[1];
		}
		throw new FileNotFound(path);
	}

	exists(path: string): Promise<boolean> {
		return this.stat(path).then(() => true, () => false);
	}

	async unlink(path: string, recursive = false): Promise<void> {
		const token = await this.pool.acquires();
		const conn = await this.getConnection();
		const stats = await this.stat(path);
		if (stats.isFile) {
			return new Promise<void>((resolve, reject) => {
				conn.delete(normalizePath(path), (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
					this.pool.release(token);
				});
			});
		}
		else if (stats.isDirectory) {
			return new Promise<void>((resolve, reject) => {
				conn.rmdir(normalizePath(path), recursive, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
					this.pool.release(token);
				});
			})
		}
	}

	async copy(source: string, destination: string): Promise<void> {
		throw new OperationNotSupported('copy');
	}

	async rename(oldPath: string, newPath: string): Promise<void> {
		const token = await this.pool.acquires();
		const conn = await this.getConnection();
		return new Promise<void>((resolve, reject) => {
			conn.rename(normalizePath(oldPath), normalizePath(newPath), (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
				this.pool.release(token);
			});
		});
	}

	async createReadStream(path: string): Promise<Readable> {
		const token = await this.pool.acquires();
		const conn = await this.getConnection();
		return new Promise<Readable>((resolve, reject) => {
			conn.get(normalizePath(path), (err, stream) => {
				if (err) {
					reject(err);
					this.pool.release(token);
					return;
				}
				stream.on('finish', () => this.pool.release(token));
				stream.on('error', () => this.pool.release(token));
				resolve(stream as Readable);
			});
		});
	}

	async createWriteStream(path: string, overwrite?: boolean, encoding?: string): Promise<Writable> {
		const exists = await this.exists(path);
		if (exists) {
			if (overwrite !== true) {
				throw new FileAlreadyExists();
			}
		}

		const token = await this.pool.acquires();
		const conn = await this.getConnection();

		const stream = new Transform({
			transform(chunk, encoding, done) {
				this.push(chunk);
				done();
			}
		});

		return new Promise<Writable>((resolve, reject) => {
			conn.put(stream, normalizePath(path), () => this.pool.release(token));
			resolve(stream);
		});
	}

	async createDirectory(path: string, recursive?: boolean): Promise<void> {
		const token = await this.pool.acquires();
		const conn = await this.getConnection();
		return new Promise<void>((resolve, reject) => {
			conn.mkdir(normalizePath(path), recursive === true, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
				this.pool.release(token);
			});
		});
	}

	async readDirectory(path: string): Promise<string[]>
	async readDirectory(path: string, stat: boolean): Promise<[string, Stats][]>
	async readDirectory(path: string, stat?: boolean): Promise<(string | [string, Stats])[]> {
		const token = await this.pool.acquires();
		const conn = await this.getConnection();
		return new Promise<(string | [string, Stats])[]>((resolve, reject) => {
			conn.list(normalizePath(path), (err, entries) => {
				if (err) {
					reject(err);
					this.pool.release(token);
					return;
				}

				entries = entries.filter(entry => entry.name !== '.' && entry.name !== '..');

				if (stat !== true) {
					resolve(entries.map(entry => entry.name));
					this.pool.release(token);
					return;
				}

				resolve(entries.map(entry => [
					entry.name,
					new Stats(
						entry.type === '-',
						entry.type === 'd',
						entry.type === 'l',
						parseInt(entry.size),
						entry.date,
						entry.date,
						entry.date
					)
				] as [string, Stats]));
				this.pool.release(token);
			});
		});
	}

}