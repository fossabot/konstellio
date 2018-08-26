import 'mocha';
import { use, should } from 'chai';
use(require("chai-as-promised"));
should();
import { FileSystemFTP } from '../src/FileSystemFTP';
import { FtpSrv } from 'ftp-srv';
import { tmpdir } from 'os';
import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { shouldBehaveLikeAFileSystem } from '@konstellio/fs/test/FileSystem';

describe('FTP', () => {

	let ftpd: FtpSrv;
	
	before(() => {
		const tmp = mkdtempSync(join(tmpdir(), 'konstellio-ftp-'));
		mkdirSync(join(tmp, 'Griffin'));
		writeFileSync(join(tmp, 'Griffin/Peter.txt'), 'Peter Griffin');
		writeFileSync(join(tmp, 'Griffin/Lois.txt'), 'Lois Pewterachmidt');
		writeFileSync(join(tmp, 'Griffin/Stewie.txt'), 'Stewie Griffin');

		ftpd = new FtpSrv('ftp://127.0.0.1:2121');
		(ftpd as any).log.level('fatal');
		ftpd.on('login', (_, resolve) => {
			resolve({ root: tmp, cwd: '/' });
		});
		return ftpd.listen();
	});




	const fsftp = new FileSystemFTP({
		host: '127.0.0.1',
		port: 2121
	});
	
	shouldBehaveLikeAFileSystem(fsftp);

	after(async () => {
		await fsftp.disposeAsync();
		await ftpd.close();
	});

});