import * as assert from 'assert';
import { Map, List, Record, Iterable } from 'immutable';

export class q {

	public static select (...fields: FieldExpression[]) {
		if (fields.length > 0) {
			return new SelectQuery().select(...fields)
		}
		return new SelectQuery();
	}

	public static aggregate (fields: { [alias: string]: CalcField }) {
		return new AggregateQuery().select(fields);
	}

	public static union (...selects: SelectQuery[]) {
		return new UnionQuery(List<SelectQuery>(selects));
	}

	public static insert (name: string, namespace?: string) {
		return new InsertQuery().collection(name, namespace);
	}

	public static update (name: string, namespace?: string) {
		return new UpdateQuery().collection(name, namespace);
	}

	public static replace (name: string, namespace?: string) {
		return new ReplaceQuery().collection(name, namespace);
	}

	public static delete (name: string, namespace?: string) {
		return new DeleteQuery().collection(name, namespace);
	}

	public static createCollection (name: string, namespace?: string) {
		return new CreateCollectionQuery().collection(name, namespace);
	}

	public static describeCollection (name: string, namespace?: string) {
		return new DescribeCollectionQuery().collection(name, namespace);
	}

	public static alterCollection (name: string, namespace?: string) {
		return new AlterCollectionQuery().collection(name, namespace);
	}

	public static collectionExists (name: string, namespace?: string) {
		return new CollectionExistsQuery().collection(name, namespace);
	}

	public static dropCollection (name: string, namespace?: string) {
		return new DropCollectionQuery().collection(name, namespace);
	}


	public static and (...queries: Expression[]): Bitwise {
		return new Bitwise("and", queries);
	}

	public static or (...queries: Expression[]): Bitwise {
		return new Bitwise("or", queries);
	}

	public static xor (...queries: Expression[]): Bitwise {
		return new Bitwise("xor", queries);
	}


	public static eq (field: FieldExpression, value: ValueExpression) {
		return new ComparisonEqual(field, value);
	}

	public static ne (field: FieldExpression, value: ValueExpression) {
		return new ComparisonNotEqual(field, value);
	}

	public static gt (field: FieldExpression, value: ValueExpression) {
		return new ComparisonGreaterThan(field, value);
	}

	public static gte (field: FieldExpression, value: ValueExpression) {
		return new ComparisonGreaterThanOrEqual(field, value);
	}

	public static lt (field: FieldExpression, value: ValueExpression) {
		return new ComparisonLesserThan(field, value);
	}

	public static lte (field: FieldExpression, value: ValueExpression) {
		return new ComparisonLesserThanOrEqual(field, value);
	}

	public static in (field: FieldExpression, values: ValueExpression[]) {
		return new ComparisonIn(field, values);
	}

	public static beginsWith (field: FieldExpression, value: string) {
		return new ComparisonBeginsWith(field, value);
	}


	public static collection (name: string, namespace?: string) {
		return new Collection(name, namespace);
	}

	public static column (name: string, type: ColumnType, defaultValue?: any, autoIncrement?: boolean) {
		return new Column(name, type, defaultValue, autoIncrement);
	}

	public static index (name: string, type: IndexType, columns?: List<SortableField>) {
		return new Index(name, type, columns);
	}

	public static field (name: string) {
		return new Field(name);
	}

	public static sort (name: string, direction?: DirectionExpression) {
		return new SortableField(name, direction);
	}

	// https://dev.mysql.com/doc/refman/5.7/en/group-by-functions.html

	
	public static count (field: FieldExpression) {
		return new CountCalcField(field);
	}

	public static avg (field: CalcFieldExpression) {
		return new AverageCalcField(field);
	}

	public static sum (field: CalcFieldExpression) {
		return new SumCalcField(field);
	}

	public static sub (field: CalcFieldExpression) {
		return new SubCalcField(field);
	}

	public static max (field: CalcFieldExpression) {
		return new MaxCalcField(field);
	}

	public static min (field: CalcFieldExpression) {
		return new MinCalcField(field);
	}

	public static concat (...fields: CalcFieldExpression[]) {
		return new ConcatCalcField(...fields);
	}

}

export enum ColumnType {
	Boolean = 'Boolean',
	Bit = 'Bit',
	UInt8 = 'UInt8',
	UInt16 = 'UInt16',
	UInt32 = 'UInt32',
	UInt64 = 'UInt64',
	Int8 = 'Int8',
	Int16 = 'Int16',
	Int32 = 'Int32',
	Int64 = 'Int64',
	Float32 = 'Float32',
	Float64 = 'Float64',
	Text = 'Text',
	Blob = 'Blob',
	Date = 'Date',
	DateTime = 'DateTime'
};

export enum IndexType {
	Index = 'Index',
	Primary = 'Primary',
	Unique = 'Unique'
};

export type FieldExpression = string | Field
export type CalcFieldExpression = string | Field | CalcField
export type ValueExpression = Field | string | number | boolean | Date | null
export type BitwiseOperatorExpression = "and" | "or" | "xor"
export type ComparisonOperatorExpression = "=" | "!=" | ">" | ">=" | "<" | "<=" | "beginsWith" | "in"
export type DirectionExpression = "asc" | "desc"
export type AggregateExpression = Map<string, CalcField>
export type DataExpression = Map<string, ValueExpression>
export type JoinExpression = Map<string, { query: SelectQuery, on: Expression }>
export type Expression = Comparison | Bitwise;

export type QueryReducer<I, O> = (node: I, accumulator: O) => void;
export type QueryReducers<T> = {
	Query?: QueryReducer<Query, T>
	Collection?: QueryReducer<Collection, T>
	Field?: QueryReducer<Field, T>
	SortableField?: QueryReducer<SortableField, T>
	CalcField?: QueryReducer<CalcField, T>
	Comparison?: QueryReducer<Comparison, T>
	Bitwise?: QueryReducer<Bitwise, T>
}

export class Query {

}

export class SelectQuery extends Query {

	private _select?: List<Field>
	private _from?: Collection
	private _join?: JoinExpression
	private _where?: Bitwise
	private _sort?: List<SortableField>
	private _offset?: number
	private _limit?: number

	constructor (select?: List<Field>, from?: Collection, join?: JoinExpression, where?: Bitwise, sort?: List<SortableField>, offset?: number, limit?: number) {
		super();

		this._select = select;
		this._from = from;
		this._join = join;
		this._where = where;
		this._sort = sort;
		this._offset = offset;
		this._limit = limit;
	}

	getSelect (): List<Field> | undefined {
		return this._select;
	}

	getFrom (): Collection | undefined {
		return this._from;
	}

	getJoin (): JoinExpression | undefined {
		return this._join;
	}

	getWhere (): Bitwise | undefined {
		return this._where;
	}

	getSort (): List<SortableField> | undefined {
		return this._sort;
	}

	getOffset (): number | undefined {
		return this._offset;
	}

	getLimit (): number | undefined {
		return this._limit;
	}

	select (...fields: FieldExpression[]): SelectQuery {
		return new SelectQuery(List<Field>(Array.from<FieldExpression>(arguments).map(f => f instanceof Field ? f : new Field(f))), this._from, this._join, this._where, this._sort, this._offset, this._limit);
	}

	from (collection: Collection): SelectQuery
	from (name: any, namespace?: string): SelectQuery
	from (name?: any, namespace?: string): SelectQuery {
		if (name && name instanceof Collection) {
			if (name === this._from) {
				return this;
			}
			return new SelectQuery(this._select, name, this._join, this._where, this._sort, this._offset, this._limit);
		}
		if (this._from && this._from.name === name && this._from.namespace === namespace) {
			return this;
		}
		return new SelectQuery(this._select, this._from ? this._from.rename(name, namespace) : new Collection(name, namespace), this._join, this._where, this._sort, this._offset, this._limit);
	}

	join (alias: string, query: SelectQuery, on: Expression): SelectQuery {
		const join = this._join ? this._join : Map<string, { query: SelectQuery, on: Expression }>();
		return new SelectQuery(this._select, this._from, join.set(alias, { query: <SelectQuery>query, on: <Expression>on }), this._where, this._sort, this._offset, this._limit);
	}

	offset (offset: number): SelectQuery {
		if (offset === this._offset) {
			return this;
		}
		return new SelectQuery(this._select, this._from, this._join, this._where, this._sort, offset, this._limit);
	}

	limit (limit: number): SelectQuery {
		if (limit === this._limit) {
			return this;
		}
		return new SelectQuery(this._select, this._from, this._join, this._where, this._sort, this._offset, limit);
	}

	where (query: Bitwise): SelectQuery {
		return new SelectQuery(this._select, this._from, this._join, query, this._sort, this._offset, this._limit);
	}

	and (queries: List<Expression>): SelectQuery
	and (...queries: Expression[]): SelectQuery
	and (): SelectQuery {
		return new SelectQuery(this._select, this._from, this._join, new Bitwise("and", Array.from<Expression>(arguments)), this._sort, this._offset, this._limit);
	}

	or (queries: List<Expression>): SelectQuery
	or (...queries: Expression[]): SelectQuery
	or (): SelectQuery {
		return new SelectQuery(this._select, this._from, this._join, new Bitwise("or", Array.from<Expression>(arguments)), this._sort, this._offset, this._limit);
	}

	xor (queries: List<Expression>): SelectQuery
	xor (...queries: Expression[]): SelectQuery
	xor (): SelectQuery {
		return new SelectQuery(this._select, this._from, this._join, new Bitwise("xor", Array.from<Expression>(arguments)), this._sort, this._offset, this._limit);
	}

	eq (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonEqual(field, value)), this._sort, this._offset, this._limit);
	}

	ne (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonNotEqual(field, value)), this._sort, this._offset, this._limit);
	}

	gt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonGreaterThan(field, value)), this._sort, this._offset, this._limit);
	}

	gte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonGreaterThanOrEqual(field, value)), this._sort, this._offset, this._limit);
	}

	lt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonLesserThan(field, value)), this._sort, this._offset, this._limit);
	}

	lte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonLesserThanOrEqual(field, value)), this._sort, this._offset, this._limit);
	}

	in (field: string, values: ValueExpression[]) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonIn(field, values)), this._sort, this._offset, this._limit);
	}

	beginsWith (field: string, value: string) {
		const where = this._where || new Bitwise('and');
		return new SelectQuery(this._select, this._from, this._join, where.add(new ComparisonBeginsWith(field, value)), this._sort, this._offset, this._limit);
	}

	sort (field: string, direction?: DirectionExpression): SelectQuery
	sort (...fields: SortableField[]): SelectQuery
	sort (): SelectQuery {
		if (arguments.length <= 2 && typeof arguments[0] === 'string') {
			const sort = this._sort ? this._sort : List<SortableField>();
			const name = <string>arguments[0];
			const direction = arguments.length === 2 ? <DirectionExpression>arguments[1] : undefined;
			return new SelectQuery(this._select, this._from, this._join, this._where, sort.push(new SortableField(name, direction)), this._offset, this._limit);
		}
		return new SelectQuery(this._select, this._from, this._join, this._where, List<SortableField>(Array.from<SortableField>(arguments)), this._offset, this._limit);
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}SELECT `;

		if (this._select) {
			query += this._select.map<string>(field => field ? field.toString() : ``).join(', ');
		} else {
			query += `*`;
		}

		if (this._from) {
			query += `${newline}${indent}FROM ${this._from.toString()}`;
		}

		if (this._join) {
			query += this._join.map<string>((value, alias) => {
				if (value) {
					return `${newline}${indent}JOIN (${value.query.toString()}) AS ${alias} ON ${value.on.toString()}`;
				}
				return '';
			}).join('');
		}

		if (this._where) {
			query += `${newline}${indent}WHERE ${this._where.toString()}`;
		}

		if (this._sort) {
			query += `${newline}${indent}SORT BY ${this._sort.map<string>(s => s ? s.toString() : '').join(', ')}`;
		}

		if (this._offset !== undefined) {
			query += `${newline}${indent}OFFSET ${this._offset}`;
		}

		if (this._limit !== undefined) {
			query += `${newline}${indent}LIMIT ${this._limit}`;
		}

		return query;
	}
}

export class UnionQuery extends Query {

	private _selects?: List<SelectQuery>
	private _sort?: List<SortableField>
	private _offset?: number
	private _limit?: number

	constructor (selects?: List<SelectQuery>, sort?: List<SortableField>, offset?: number, limit?: number) {
		super();

		this._selects = selects;
		this._sort = sort;
		this._offset = offset;
		this._limit = limit;
	}

	getSelect (): List<SelectQuery> | undefined {
		return this._selects;
	}

	getSort (): List<SortableField> | undefined {
		return this._sort;
	}

	getOffset (): number | undefined {
		return this._offset;
	}

	getLimit (): number | undefined {
		return this._limit;
	}

	select (...selects: SelectQuery[]): UnionQuery {
		return new UnionQuery(List<SelectQuery>(Array.from<SelectQuery>(arguments)), this._sort, this._offset, this._limit);
	}

	offset (offset: number): UnionQuery {
		if (offset === this._limit) {
			return this;
		}
		return new UnionQuery(this._selects, this._sort, offset, this._limit);
	}

	limit (limit: number): UnionQuery {
		if (limit === this._limit) {
			return this;
		}
		return new UnionQuery(this._selects, this._sort, this._offset, limit);
	}

	sort (field: string, direction?: DirectionExpression): UnionQuery
	sort (...fields: SortableField[]): UnionQuery
	sort (): UnionQuery {
		if (arguments.length <= 2 && typeof arguments[0] === 'string') {
			const sort = this._sort ? this._sort : List<SortableField>();
			const name = <string>arguments[0];
			const direction = arguments.length === 2 ? <DirectionExpression>arguments[1] : undefined;
			return new UnionQuery(this._selects, sort.push(new SortableField(name, direction)), this._offset, this._limit);
		}
		
		return new UnionQuery(this._selects, List<SortableField>(Array.from<SortableField>(arguments)), this._offset, this._limit);
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';

		if (this._selects) {
			let query = `(${newline}${this._selects.map<string>(s => s ? s.toString(!!multiline, `${indent}\t`) : '').join(`${newline}) UNION (${newline}`)}${newline})`;

			if (this._sort) {
				query += `${newline}${indent}SORT BY ${this._sort.map<string>(s => s ? s.toString() : '').join(', ')}`;
			}

			if (this._offset !== undefined) {
				query += `${newline}${indent}OFFSET ${this._offset}`;
			}

			if (this._limit !== undefined) {
				query += `${newline}${indent}LIMIT ${this._limit}`;
			}

			return query;
		}
		return '';
	}
}

export class AggregateQuery extends Query {
	private _select?: AggregateExpression
	private _from?: Collection
	private _join?: JoinExpression
	private _where?: Bitwise
	private _group?: List<Field>
	private _sort?: List<SortableField>
	private _offset?: number
	private _limit?: number

	constructor (select?: AggregateExpression, from?: Collection, join?: JoinExpression, where?: Bitwise, group?: List<Field>, sort?: List<SortableField>, offset?: number, limit?: number) {
		super();

		this._select = select;
		this._from = from;
		this._where = where;
		this._group = group;
		this._sort = sort;
		this._offset = offset;
		this._limit = limit;
	}

	getSelect (): AggregateExpression | undefined {
		return this._select;
	}

	getFrom (): Collection | undefined {
		return this._from;
	}

	getJoin (): JoinExpression | undefined {
		return this._join;
	}

	getWhere (): Bitwise | undefined {
		return this._where;
	}

	getGroup (): List<Field> | undefined {
		return this._group;
	}

	getSort (): List<SortableField> | undefined {
		return this._sort;
	}

	getOffset (): number | undefined {
		return this._offset;
	}

	getLimit (): number | undefined {
		return this._limit;
	}

	select (fields: { [field: string]: CalcField }): AggregateQuery
	select (fields: AggregateExpression): AggregateQuery
	select (fields: any): AggregateQuery {
		return new AggregateQuery(Map<string, CalcField>(fields), this._from, this._join, this._where, this._group, this._sort, this._offset, this._limit);
	}

	from (collection: Collection): AggregateQuery
	from (name: any, namespace?: string): AggregateQuery
	from (name?: any, namespace?: string): AggregateQuery {
		if (name && name instanceof Collection) {
			if (name === this._from) {
				return this;
			}
			return new AggregateQuery(this._select, name, this._join, this._where, this._group, this._sort, this._offset, this._limit);
		}
		if (this._from && this._from.name === name && this._from.namespace === namespace) {
			return this;
		}
		return new AggregateQuery(this._select, this._from ? this._from.rename(name, namespace) : new Collection(name, namespace), this._join, this._where, this._group, this._sort, this._offset, this._limit);
	}

	join (alias: string, query: SelectQuery, on: Expression): AggregateQuery {
		const join = this._join ? this._join : Map<string, { query: SelectQuery, on: Expression }>();
		return new AggregateQuery(this._select, this._from, join.set(alias, { query: <SelectQuery>query, on: <Expression>on }), this._where, this._group, this._sort, this._offset, this._limit);
	}

	offset (offset: number): AggregateQuery {
		if (offset === this._offset) {
			return this;
		}
		return new AggregateQuery(this._select, this._from, this._join, this._where, this._group, this._sort, offset, this._limit);
	}

	limit (limit: number): AggregateQuery {
		if (limit === this._limit) {
			return this;
		}
		return new AggregateQuery(this._select, this._from, this._join, this._where, this._group, this._sort, this._offset, limit);
	}

	where (query: Bitwise): AggregateQuery {
		return new AggregateQuery(this._select, this._from, this._join, query, this._group, this._sort, this._offset, this._limit);
	}

	and (queries: List<Expression>): AggregateQuery
	and (...queries: Expression[]): AggregateQuery
	and (): AggregateQuery {
		return new AggregateQuery(this._select, this._from, this._join, new Bitwise("and", Array.from<Expression>(arguments)), this._group, this._sort, this._offset, this._limit);
	}

	or (queries: List<Expression>): AggregateQuery
	or (...queries: Expression[]): AggregateQuery
	or (): AggregateQuery {
		return new AggregateQuery(this._select, this._from, this._join, new Bitwise("or", Array.from<Expression>(arguments)), this._group, this._sort, this._offset, this._limit);
	}

	xor (queries: List<Expression>): AggregateQuery
	xor (...queries: Expression[]): AggregateQuery
	xor (): AggregateQuery {
		return new AggregateQuery(this._select, this._from, this._join, new Bitwise("xor", Array.from<Expression>(arguments)), this._group, this._sort, this._offset, this._limit);
	}

	eq (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonEqual(field, value)), this._group, this._sort, this._offset, this._limit);
	}

	ne (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonNotEqual(field, value)), this._group, this._sort, this._offset, this._limit);
	}

	gt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonGreaterThan(field, value)), this._group, this._sort, this._offset, this._limit);
	}

	gte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonGreaterThanOrEqual(field, value)), this._group, this._sort, this._offset, this._limit);
	}

	lt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonLesserThan(field, value)), this._group, this._sort, this._offset, this._limit);
	}

	lte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonLesserThanOrEqual(field, value)), this._group, this._sort, this._offset, this._limit);
	}

	in (field: string, values: ValueExpression[]) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonIn(field, values)), this._group, this._sort, this._offset, this._limit);
	}

	beginsWith (field: string, value: string) {
		const where = this._where || new Bitwise('and');
		return new AggregateQuery(this._select, this._from, this._join, where.add(new ComparisonBeginsWith(field, value)), this._group, this._sort, this._offset, this._limit);
	}

	sort (field: string, direction?: DirectionExpression): AggregateQuery
	sort (...fields: SortableField[]): AggregateQuery
	sort (): AggregateQuery {
		if (arguments.length <= 2 && typeof arguments[0] === 'string') {
			const sort = this._sort ? this._sort : List<SortableField>();
			const name = <string>arguments[0];
			const direction = arguments.length === 2 ? <DirectionExpression>arguments[1] : undefined;
			return new AggregateQuery(this._select, this._from, this._join, this._where, this._group, sort.push(new SortableField(name, direction)), this._offset, this._limit);
		}
		return new AggregateQuery(this._select, this._from, this._join, this._where, this._group, List<SortableField>(Array.from<SortableField>(arguments)), this._offset, this._limit);
	}

	group (...fields: FieldExpression[]): AggregateQuery {
		return new AggregateQuery(this._select, this._from, this._join, this._where, List<Field>(fields.map(f => f instanceof Field ? f : new Field(f))), this._sort, this._offset, this._limit);
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}AGGREGATE `;

		if (this._select) {
			query += this._select.map<string>((field, alias) => field && alias ? `${field.toString()} AS ${alias}` : ``).join(', ');
		} else {
			query += `*`;
		}

		if (this._from) {
			query += `${newline}${indent}FROM ${this._from.toString()}`;
		}

		if (this._join) {
			query += this._join.map<string>((value, alias) => {
				if (value) {
					return `${newline}${indent}JOIN (${value.query.toString()}) AS ${alias} ON ${value.on.toString()}`;
				}
				return '';
			}).join('');
		}

		if (this._where) {
			query += `${newline}${indent}WHERE ${this._where.toString()}`;
		}

		if (this._group) {
			query += `${newline}${indent}GROUP BY ${this._group.map<string>(s => s ? s.toString() : '').join(', ')}`;
		}

		if (this._sort) {
			query += `${newline}${indent}SORT BY ${this._sort.map<string>(s => s ? s.toString() : '').join(', ')}`;
		}

		if (this._offset !== undefined) {
			query += `${newline}${indent}OFFSET ${this._offset}`;
		}

		if (this._limit !== undefined) {
			query += `${newline}${indent}LIMIT ${this._limit}`;
		}

		return query;
	}
}

export class InsertQuery extends Query {
	private _data?: DataExpression
	private _collection?: Collection

	constructor (data?: DataExpression, collection?: Collection) {
		super();

		this._data = data;
		this._collection = collection;
	}

	getFields (): DataExpression | undefined {
		return this._data;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	fields (data: { [field: string]: ValueExpression }): InsertQuery
	fields (data: DataExpression): InsertQuery
	fields (data: any): InsertQuery {
		return new InsertQuery(Map<string, ValueExpression>(data), this._collection);
	}

	collection (collection: Collection): InsertQuery
	collection (name: string, namespace?: string): InsertQuery
	collection (name?: any, namespace?: string): InsertQuery {
		if (name && name instanceof Collection) {
			return new InsertQuery(this._data, name);
		}
		return new InsertQuery(this._data, this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace));
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}INSERT `;

		if (this._collection) {
			query += this._collection.toString();
		}

		if (this._data) {
			query += `${newline}${indent}(${this._data.map<string>((value, key) => key || '').join(', ')})`;
			query += `${newline}${indent}VALUES (${this._data.map<string>(value => {
				if (typeof value === 'string') {
					return `"${value}"`;
				}
				return `${value}`;
			}).join(', ')})`;
		}

		return query;
	}
}

export class UpdateQuery extends Query {
	private _data?: DataExpression
	private _collection?: Collection
	private _where?: Bitwise
	private _limit?: number

	constructor (data?: DataExpression, collection?: Collection, where?: Bitwise, limit?: number) {
		super();

		this._data = data;
		this._collection = collection;
		this._where = where;
		this._limit = limit;
	}

	getFields (): DataExpression | undefined {
		return this._data;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	getWhere (): Bitwise | undefined {
		return this._where;
	}

	getLimit (): number | undefined {
		return this._limit;
	}

	fields (data: { [field: string]: ValueExpression }): UpdateQuery
	fields (data: DataExpression): UpdateQuery
	fields (data: any): UpdateQuery {
		return new UpdateQuery(Map<string, ValueExpression>(data), this._collection, this._where, this._limit);
	}

	collection (collection: Collection): UpdateQuery
	collection (name: string, namespace?: string): UpdateQuery
	collection (name?: any, namespace?: string): UpdateQuery {
		if (name && name instanceof Collection) {
			return new UpdateQuery(this._data, name, this._where, this._limit);
		}
		return new UpdateQuery(this._data, this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace), this._where, this._limit);
	}

	limit (limit: number): UpdateQuery {
		if (limit === this._limit) {
			return this;
		}
		return new UpdateQuery(this._data, this._collection, this._where, limit);
	}

	where (query: Bitwise): UpdateQuery {
		return new UpdateQuery(this._data, this._collection, query, this._limit);
	}

	and (queries: List<Expression>): UpdateQuery
	and (...queries: Expression[]): UpdateQuery
	and (): UpdateQuery {
		return new UpdateQuery(this._data, this._collection, new Bitwise("and", Array.from<Expression>(arguments)), this._limit);
	}

	or (queries: List<Expression>): UpdateQuery
	or (...queries: Expression[]): UpdateQuery
	or (): UpdateQuery {
		return new UpdateQuery(this._data, this._collection, new Bitwise("or", Array.from<Expression>(arguments)), this._limit);
	}

	xor (queries: List<Expression>): UpdateQuery
	xor (...queries: Expression[]): UpdateQuery
	xor (): UpdateQuery {
		return new UpdateQuery(this._data, this._collection, new Bitwise("xor", Array.from<Expression>(arguments)), this._limit);
	}

	eq (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonEqual(field, value)), this._limit);
	}

	ne (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonNotEqual(field, value)), this._limit);
	}

	gt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonGreaterThan(field, value)), this._limit);
	}

	gte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonGreaterThanOrEqual(field, value)), this._limit);
	}

	lt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonLesserThan(field, value)), this._limit);
	}

	lte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonLesserThanOrEqual(field, value)), this._limit);
	}

	in (field: string, values: ValueExpression[]) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonIn(field, values)), this._limit);
	}

	beginsWith (field: string, value: string) {
		const where = this._where || new Bitwise('and');
		return new UpdateQuery(this._data, this._collection, where.add(new ComparisonBeginsWith(field, value)), this._limit);
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}UPDATE `;

		if (this._collection) {
			query += this._collection.toString();
		}

		if (this._data) {
			query += `${newline}${indent}(${this._data.map<string>((value, key) => key || '').join(', ')})`;
			query += `${newline}${indent}VALUES (${this._data.map<string>(value => {
				if (typeof value === 'string') {
					return `"${value}"`;
				}
				return `${value}`;
			}).join(', ')})`;
		}

		if (this._where) {
			query += `${newline}${indent}WHERE ${newline}${indent}WHERE ${this._where.toString()}`;
		}

		if (this._limit !== undefined) {
			query += `${newline}${indent}LIMIT ${this._limit}`;
		}

		return query;
	}
}

export class ReplaceQuery extends Query {
	private _data?: DataExpression
	private _collection?: Collection
	private _where?: Bitwise
	private _limit?: number

	constructor (data?: DataExpression, collection?: Collection, where?: Bitwise, limit?: number) {
		super();

		this._data = data;
		this._collection = collection;
		this._where = where;
		this._limit = limit;
	}

	getFields (): DataExpression | undefined {
		return this._data;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	getWhere (): Bitwise | undefined {
		return this._where;
	}

	getLimit (): number | undefined {
		return this._limit;
	}

	fields (data: { [field: string]: ValueExpression }): ReplaceQuery
	fields (data: DataExpression): ReplaceQuery
	fields (data: any): ReplaceQuery {
		return new ReplaceQuery(Map<string, ValueExpression>(data), this._collection, this._where, this._limit);
	}

	collection (collection: Collection): ReplaceQuery
	collection (name: string, namespace?: string): ReplaceQuery
	collection (name?: any, namespace?: string): ReplaceQuery {
		if (name && name instanceof Collection) {
			return new ReplaceQuery(this._data, name, this._where, this._limit);
		}
		return new ReplaceQuery(this._data, this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace), this._where, this._limit);
	}

	limit (limit: number): ReplaceQuery {
		if (limit === this._limit) {
			return this;
		}
		return new ReplaceQuery(this._data, this._collection, this._where, limit);
	}

	where (query: Bitwise): ReplaceQuery {
		return new ReplaceQuery(this._data, this._collection, query, this._limit);
	}

	and (queries: List<Expression>): ReplaceQuery
	and (...queries: Expression[]): ReplaceQuery
	and (): ReplaceQuery {
		return new ReplaceQuery(this._data, this._collection, new Bitwise("and", Array.from<Expression>(arguments)), this._limit);
	}

	or (queries: List<Expression>): ReplaceQuery
	or (...queries: Expression[]): ReplaceQuery
	or (): ReplaceQuery {
		return new ReplaceQuery(this._data, this._collection, new Bitwise("or", Array.from<Expression>(arguments)), this._limit);
	}

	xor (queries: List<Expression>): ReplaceQuery
	xor (...queries: Expression[]): ReplaceQuery
	xor (): ReplaceQuery {
		return new ReplaceQuery(this._data, this._collection, new Bitwise("xor", Array.from<Expression>(arguments)), this._limit);
	}

	eq (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonEqual(field, value)), this._limit);
	}

	ne (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonNotEqual(field, value)), this._limit);
	}

	gt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonGreaterThan(field, value)), this._limit);
	}

	gte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonGreaterThanOrEqual(field, value)), this._limit);
	}

	lt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonLesserThan(field, value)), this._limit);
	}

	lte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonLesserThanOrEqual(field, value)), this._limit);
	}

	in (field: string, values: ValueExpression[]) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonIn(field, values)), this._limit);
	}

	beginsWith (field: string, value: string) {
		const where = this._where || new Bitwise('and');
		return new ReplaceQuery(this._data, this._collection, where.add(new ComparisonBeginsWith(field, value)), this._limit);
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}REPLACE `;

		if (this._collection) {
			query += this._collection.toString();
		}

		if (this._data) {
			query += `${newline}${indent}(${this._data.map<string>((value, key) => key || '').join(', ')})`;
			query += `${newline}${indent}VALUES (${this._data.map<string>(value => {
				if (typeof value === 'string') {
					return `"${value}"`;
				}
				return `${value}`;
			}).join(', ')})`;
		}

		if (this._where) {
			query += `${newline}${indent}WHERE ${newline}${indent}WHERE ${this._where.toString()}`;
		}

		if (this._limit !== undefined) {
			query += `${newline}${indent}LIMIT ${this._limit}`;
		}

		return query;
	}
}

export class DeleteQuery extends Query {
	private _collection?: Collection
	private _where?: Bitwise
	private _limit?: number

	constructor (collection?: Collection, where?: Bitwise, limit?: number) {
		super();

		this._collection = collection;
		this._where = where;
		this._limit = limit;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	getWhere (): Bitwise | undefined {
		return this._where;
	}

	getLimit (): number | undefined {
		return this._limit;
	}

	collection (collection: Collection): DeleteQuery
	collection (name: string, namespace?: string): DeleteQuery
	collection (name?: any, namespace?: string): DeleteQuery {
		if (name && name instanceof Collection) {
			return new DeleteQuery(name, this._where, this._limit);
		}
		return new DeleteQuery(this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace), this._where, this._limit);
	}

	limit (limit: number): DeleteQuery {
		if (limit === this._limit) {
			return this;
		}
		return new DeleteQuery(this._collection, this._where, limit);
	}

	where (query: Bitwise): DeleteQuery {
		return new DeleteQuery(this._collection, query, this._limit);
	}

	and (queries: List<Expression>): DeleteQuery
	and (...queries: Expression[]): DeleteQuery
	and (): DeleteQuery {
		return new DeleteQuery(this._collection, new Bitwise("and", Array.from<Expression>(arguments)), this._limit);
	}

	or (queries: List<Expression>): DeleteQuery
	or (...queries: Expression[]): DeleteQuery
	or (): DeleteQuery {
		return new DeleteQuery(this._collection, new Bitwise("or", Array.from<Expression>(arguments)), this._limit);
	}

	xor (queries: List<Expression>): DeleteQuery
	xor (...queries: Expression[]): DeleteQuery
	xor (): DeleteQuery {
		return new DeleteQuery(this._collection, new Bitwise("xor", Array.from<Expression>(arguments)), this._limit);
	}

	eq (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonEqual(field, value)), this._limit);
	}

	ne (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonNotEqual(field, value)), this._limit);
	}

	gt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonGreaterThan(field, value)), this._limit);
	}

	gte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonGreaterThanOrEqual(field, value)), this._limit);
	}

	lt (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonLesserThan(field, value)), this._limit);
	}

	lte (field: string, value: ValueExpression) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonLesserThanOrEqual(field, value)), this._limit);
	}

	in (field: string, values: ValueExpression[]) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonIn(field, values)), this._limit);
	}

	beginsWith (field: string, value: string) {
		const where = this._where || new Bitwise('and');
		return new DeleteQuery(this._collection, where.add(new ComparisonBeginsWith(field, value)), this._limit);
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}DELETE `;

		if (this._collection) {
			query += this._collection.toString();
		}

		if (this._where) {
			query += `${newline}${indent}WHERE ${this._where.toString()}`;
		}

		if (this._limit !== undefined) {
			query += `${newline}${indent}LIMIT ${this._limit}`;
		}

		return query;
	}
}

export class CreateCollectionQuery extends Query {
	private _collection?: Collection
	private _columns?: List<Column>
	private _indexes?: List<Index>

	constructor (collection?: Collection, columns?: List<Column>, indexes?: List<Index>) {
		super();

		this._collection = collection;
		this._columns = columns;
		this._indexes = indexes;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	getColumns (): List<Column> | undefined {
		return this._columns;
	}

	getIndexes (): List<Index> | undefined {
		return this._indexes;
	}

	collection (collection: Collection): CreateCollectionQuery
	collection (name: string, namespace?: string): CreateCollectionQuery
	collection (name?: any, namespace?: string): CreateCollectionQuery {
		if (name && name instanceof Collection) {
			return new CreateCollectionQuery(name, this._columns);
		}
		return new CreateCollectionQuery(this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace), this._columns, this._indexes);
	}

	columns (...columns: Column[]): CreateCollectionQuery {
		return new CreateCollectionQuery(this._collection, List<Column>(columns), this._indexes);
	}

	indexes (...indexes: Index[]): CreateCollectionQuery {
		return new CreateCollectionQuery(this._collection, this._columns, List<Index>(indexes));
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}CREATE COLLECTION `;

		if (this._collection) {
			query += this._collection.toString();
		}

		query += ` (`;
		

		if (this._columns) {
			query += `${newline}${indent}${this._columns.map<string>(c => c ? c.toString() : '').join(`,${newline}${indent}`)}`;
		}

		query += `${newline}${indent})`;

		if (this._indexes) {
			query += ` ${newline}${indent}INDEXES (`;
			query += `${newline}${indent}${this._indexes.map<string>(i => i ? i.toString() : '').join(`,${newline}${indent}`)}`;
			query += `${newline}${indent})`;
		}

		return query;
	}
}

export class DescribeCollectionQuery extends Query {
	private _collection?: Collection
	
	constructor (collection?: Collection) {
		super();

		this._collection = collection;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	collection (collection: Collection): DescribeCollectionQuery
	collection (name: string, namespace?: string): DescribeCollectionQuery
	collection (name?: any, namespace?: string): DescribeCollectionQuery {
		if (name && name instanceof Collection) {
			return new DescribeCollectionQuery(name);
		}
		return new DescribeCollectionQuery(this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace));
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}DESCRIBE COLLECTION `;

		if (this._collection) {
			query += this._collection.toString();
		}

		return query;
	}
}

export class AlterCollectionQuery extends Query {
	private _collection?: Collection
	private _columns?: List<Column>

	constructor (collection?: Collection, columns?: List<Column>) {
		super();

		this._collection = collection;
		this._columns = columns;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	getColumns (): List<Column> | undefined {
		return this._columns;
	}

	collection (collection: Collection): AlterCollectionQuery
	collection (name: string, namespace?: string): AlterCollectionQuery
	collection (name?: any, namespace?: any): AlterCollectionQuery {
		if (name && name instanceof Collection) {
			return new AlterCollectionQuery(name, this._columns);
		}
		return new AlterCollectionQuery(this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace), this._columns);
	}

	columns (...columns: Column[]): AlterCollectionQuery {
		return new AlterCollectionQuery(this._collection, List<Column>(columns));
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}ALTER COLLECTION `;

		if (this._collection) {
			query += this._collection.toString();
		}

		query += ` (`;
		

		if (this._columns) {
			query += `${newline}${indent}${this._columns.map<string>(c => c ? c.toString() : '').join(`,${newline}${indent}`)}`;
		}

		query += `${newline}${indent})`;

		return query;
	}
}

export class CollectionExistsQuery extends Query {
	private _collection?: Collection

	constructor (collection?: Collection) {
		super();

		this._collection = collection;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	collection (collection: Collection): CollectionExistsQuery
	collection (name: string, namespace?: string): CollectionExistsQuery
	collection (name?: any, namespace?: string): CollectionExistsQuery {
		if (name && name instanceof Collection) {
			return new CollectionExistsQuery(name);
		}
		return new CollectionExistsQuery(this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace));
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}COLLECTION EXISTS `;

		if (this._collection) {
			query += this._collection.toString();
		}

		return query;
	}
}

export class DropCollectionQuery extends Query {
	private _collection?: Collection

	constructor (collection?: Collection) {
		super();

		this._collection = collection;
	}

	getCollection (): Collection | undefined {
		return this._collection;
	}

	collection (collection: Collection): DropCollectionQuery
	collection (name: string, namespace?: string): DropCollectionQuery
	collection (name?: any, namespace?: string): DropCollectionQuery {
		if (name && name instanceof Collection) {
			return new DropCollectionQuery(name);
		}
		return new DropCollectionQuery(this._collection ? this._collection.rename(name, namespace) : new Collection(name, namespace));
	}

	toString (): string
	toString (multiline: boolean): string
	toString (multiline: boolean, indent: string): string
	toString (multiline?: boolean, indent?: string): string {
		multiline = !!multiline;
		indent = multiline && indent ? indent : '';

		let newline = multiline ? `\n` : ' ';
		let query = `${indent}DROP COLLECTION `;

		if (this._collection) {
			query += this._collection.toString();
		}

		return query;
	}
}

export class Collection {
	private _name: string
	private _namespace?: string

	constructor (name: string, namespace?: string) {
		this._name = name;
		this._namespace = namespace;
	}

	public get name () {
		return this._name;
	}

	public get namespace () {
		return this._namespace;
	}

	public rename (name: string, namespace?: string) {
		if (name === this._name && namespace === this._namespace) {
			return this;
		}
		return new Collection(name, namespace);
	}

	public toString () {
		if (this._namespace) {
			return `${this._namespace}.${this._name}`;
		}
		return this._name;
	}
}

export class Column {
	private _name: string
	private _type: ColumnType
	private _defaultValue?: any
	private _autoIncrement?: boolean


	constructor (name: string, type: ColumnType, defaultValue?: any, autoIncrement?: boolean) {
		this._name = name;
		this._type = type;
		this._defaultValue = defaultValue;
		this._autoIncrement = autoIncrement;
	}

	getName(): string | undefined {
		return this._name;
	}

	getType(): ColumnType | undefined {
		return this._type;
	}

	getDefaultValue(): any | undefined {
		return this._defaultValue;
	}

	getAutoIncrement(): boolean | undefined {
		return this._autoIncrement;
	}

	name (name: string): Column
	name (name?: any): any {
		if (typeof name === 'string') {
			return new Column(name, this._type, this._defaultValue, this._autoIncrement);
		}
		return this._name;
	}

	type (type: ColumnType): Column
	type (type?: any): any {
		if (type) {
			return new Column(this._name, type, this._defaultValue, this._autoIncrement);
		}
		return this._type;
	}

	defaultValue (defaultValue: any): Column
	defaultValue (defaultValue?: any): any {
		if (defaultValue) {
			return new Column(this._name, this._type, defaultValue, this._autoIncrement);
		}
		return this._defaultValue;
	}

	autoIncrement (autoIncrement: boolean): Column
	autoIncrement (autoIncrement?: any): any {
		if (typeof autoIncrement === 'boolean') {
			return new Column(this._name, this._type, this._defaultValue, autoIncrement);
		}
		return this._autoIncrement;
	}

	public toString () {
		return [
			this._name,
			this._type.toString().toLocaleUpperCase(),
			this._defaultValue ? `DEFAULT(${this._defaultValue})` : ``,
			this._autoIncrement ? `AUTOINCREMENT` : ``,
		].filter(s => s).join(' ');
	}
}

export class Index {
	private _name: string
	private _type: IndexType
	private _columns?: List<SortableField>

	constructor (name: string, type: IndexType, columns?: List<SortableField>) {
		this._name = name;
		this._type = type;
		this._columns = columns;
	}

	getName(): string | undefined {
		return this._name;
	}

	getType(): IndexType | undefined {
		return this._type;
	}

	getColumns(): List<SortableField> | undefined {
		return this._columns;
	}

	name (name: string): Index
	name (name?: any): any {
		if (typeof name === 'string') {
			return new Index(name, this._type, this._columns);
		}
		return this._name;
	}

	type (type: IndexType): Index
	type (type?: any): any {
		if (type) {
			return new Index(this._name, type, this._columns);
		}
		return this._type;
	}

	columns (column: string, direction?: DirectionExpression): Index
	columns (...columns: SortableField[]): Index
	columns (): any {
		if (arguments.length <= 2 && typeof arguments[0] === 'string') {
			const sort = this._columns ? this._columns : List<SortableField>();
			const name = <string>arguments[0];
			const direction = arguments.length === 2 ? <DirectionExpression>arguments[1] : undefined;
			return new Index(this._name, this._type, sort.push(new SortableField(name, direction)));
		}
		else if (arguments.length > 0) {
			return new Index(this._name, this._type, List<SortableField>(Array.from<SortableField>(arguments)));
		}
		return this._columns;
	}

	public toString () {
		return `${this._type.toString().toLocaleUpperCase()} ${this._name} (${this._columns ? this._columns.map<string>(c => c ? c.toString() : '').join(', ') : ''})`;
	}
}

export class Field {
	private _name: string
	private _table?: string

	constructor (name: string, table?: string) {
		this._name = name;
		this._table = table;
	}

	public get name () {
		return this._name;
	}

	public get table () {
		return this._table;
	}

	public rename (name: string, table?: string) {
		if (name === this._name && this._table === table) {
			return this;
		}
		return new Field(name, table);
	}

	public toString () {
		if (this._table) {
			return `${this.table}.${this._name}`;
		}
		return `${this._name}`;
	}
}

export class SortableField {
	private _name: string
	private _direction?: DirectionExpression

	constructor (name: string, direction?: DirectionExpression) {
		this._name = name;
		this._direction = direction;
	}

	public get name () {
		return this._name;
	}

	public get direction () {
		return this._direction;
	}

	public rename (name: string) {
		if (name === this._name) {
			return this;
		}
		return new SortableField(name, this._direction);
	}

	public sort (direction: DirectionExpression) {
		if (direction === this._direction) {
			return this;
		}
		return new SortableField(this._name, direction);
	}

	public toString () {
		if (this._direction) {
			return `${this._name} ${this._direction}`;
		}
		return this._name;
	}
}

export class CalcField {
	private _function: string

	constructor (fn: string) {
		this._function = fn;
	}

	public get function () {
		return this._function;
	}

	public toString () {
		return `${this._function.toLocaleUpperCase()}()`;
	}
}

export class CountCalcField extends CalcField {

	private _field: Field

	constructor (field: FieldExpression) {
		super('count');
		this._field = field instanceof Field ? field : new Field(field);
	}

	public get field () {
		return this._field;
	}

	public toString () {
		return `COUNT(${this._field.toString()})`;
	}
}

export class AverageCalcField extends CalcField {

	private _field: Field | CalcField

	constructor (field: CalcFieldExpression) {
		super('avg');
		this._field = typeof field === 'string' ? new Field(field) : field;
	}

	public get field () {
		return this._field;
	}

	public toString () {
		return `AVG(${this._field.toString()})`;
	}
}

export class SumCalcField extends CalcField {

	private _field: Field | CalcField

	constructor (field: CalcFieldExpression) {
		super('sum');
		this._field = typeof field === 'string' ? new Field(field) : field;
	}

	public get field () {
		return this._field;
	}

	public toString () {
		return `SUM(${this._field.toString()})`;
	}
}

export class SubCalcField extends CalcField {

	private _field: Field | CalcField

	constructor (field: CalcFieldExpression) {
		super('sub');
		this._field = typeof field === 'string' ? new Field(field) : field;
	}

	public get field () {
		return this._field;
	}

	public toString () {
		return `SUB(${this._field.toString()})`;
	}
}

export class MaxCalcField extends CalcField {

	private _fields: List<Field | CalcField>

	constructor (...fields: CalcFieldExpression[]) {
		super('max');
		this._fields = List<Field | CalcField>(fields.map(f => typeof f === 'string' ? new Field(f) : f));
	}

	public get fields () {
		return this._fields;
	}

	public toString () {
		return `MAX(${this._fields.map(f => f ? f.toString() : '').join(', ')})`;
	}
}

export class MinCalcField extends CalcField {

	private _fields: List<Field | CalcField>

	constructor (...fields: CalcFieldExpression[]) {
		super('min');
		this._fields = List<Field | CalcField>(fields.map(f => typeof f === 'string' ? new Field(f) : f));
	}

	public get fields () {
		return this._fields;
	}

	public toString () {
		return `MIN(${this._fields.map(f => f ? f.toString() : '').join(', ')})`;
	}
}

export class ConcatCalcField extends CalcField {

	private _fields: List<Field | CalcField>

	constructor (...fields: CalcFieldExpression[]) {
		super('concat');
		this._fields = List<Field | CalcField>(fields.map(f => typeof f === 'string' ? new Field(f) : f));
	}

	public get fields () {
		return this._fields;
	}

	public toString () {
		return `CONCAT(${this._fields.map(f => f ? f.toString() : '').join(', ')})`;
	}
}

export class Comparison {
	protected _field: FieldExpression
	protected _operator: ComparisonOperatorExpression

	constructor (field: FieldExpression, operator: ComparisonOperatorExpression) {
		this._field = field;
		this._operator = operator;
	}

	public get field () {
		return this._field;
	}

	public get operator () {
		return this._operator;
	}

	public toString (): string {
		return `${this._field.toString()} ${this._operator}`;
	}
}

export class ComparisonSimple extends Comparison {
	private _value?: ValueExpression

	constructor (field: FieldExpression, operator: ComparisonOperatorExpression, value: ValueExpression) {
		super(field, operator);
		this._value = value;
	}

	public get value () {
		return this._value;
	}

	set (value: ValueExpression) {
		if (value === this._value) {
			return this;
		}
		return new ComparisonSimple(this._field, this._operator, value);
	}

	public toString () {
		const value = typeof this._value === 'string' ? `"${this._value}"` : `${this._value}`;
		return `${this._field.toString()} ${this._operator} ${value}`;
	}
}

export class ComparisonEqual extends ComparisonSimple {
	constructor (field: FieldExpression, value: ValueExpression) {
		super(field, '=', value);
	}
}

export class ComparisonNotEqual extends ComparisonSimple {
	constructor (field: FieldExpression, value: ValueExpression) {
		super(field, '!=', value);
	}
}

export class ComparisonGreaterThan extends ComparisonSimple {
	constructor (field: FieldExpression, value: ValueExpression) {
		super(field, '>', value);
	}
}

export class ComparisonGreaterThanOrEqual extends ComparisonSimple {
	constructor (field: FieldExpression, value: ValueExpression) {
		super(field, '>=', value);
	}
}

export class ComparisonLesserThan extends ComparisonSimple {
	constructor (field: FieldExpression, value: ValueExpression) {
		super(field, '<', value);
	}
}

export class ComparisonLesserThanOrEqual extends ComparisonSimple {
	constructor (field: FieldExpression, value: ValueExpression) {
		super(field, '<=', value);
	}
}

export class ComparisonBeginsWith extends ComparisonSimple {
	constructor (field: FieldExpression, value: ValueExpression) {
		super(field, 'beginsWith', value);
	}
}

export class ComparisonIn extends Comparison {
	private _values?: List<ValueExpression>

	constructor (field: FieldExpression, values: ValueExpression[]) {
		super(field, 'in');

		this._values = List<ValueExpression>(values);
	}

	public get values () {
		return this._values;
	}

	set (...values: ValueExpression[]) {
		return new ComparisonIn(this._field, values);
	}

	public toString () {
		const value: string = this._values ? `(${this._values.map<string>(v => {
			if (typeof v === 'string') {
				return `"${v}"`;
			}
			return `${v}`;
		}).join(', ')})` : '';

		return `${this._field.toString()} ${this._operator} ${value}`;
	}
}

export class Bitwise {
	private _operator: BitwiseOperatorExpression
	private _operands?: List<Expression>

	constructor (operator: BitwiseOperatorExpression, queries?: Expression[] | List<Expression>) {
		this._operator = operator;
		this._operands = queries ? List<Expression>(queries) : List<Expression>();
	}

	public get operator () {
		return this._operator;
	}

	public get operands () {
		return this._operands;
	}

	public get isLeaf () {
		return this.operands === undefined || this.operands.filter(op => op instanceof Bitwise).count() === 0;
	}

	public add (expr: Expression) {
		return new Bitwise(this._operator, this._operands ? this._operands.push(expr) : undefined);
	}

	public remove (expr: Expression) {
		if (this._operands) {
			if (this._operands.contains(expr)) {
				return new Bitwise(this._operator, this._operands.filter(op => op !== expr).toList());
			}
		}
		return this;
	}

	public replace (searchValue: Expression, newValue: Expression, deep?: boolean): Bitwise {
		if (this === searchValue) {
			return <Bitwise>newValue;
		}
		if (this._operands) {
			const replaced = this._operands.withMutations((list) => {
				list.forEach((op, idx = 0) => {
					if (op === searchValue) {
						list = list.update(idx, (op) => newValue);
					}
					else if (op instanceof Bitwise && deep === true) {
						const opUpdated = op.replace(searchValue, newValue, true);
						if (op !== opUpdated) {
							list = list.update(idx, (op) => opUpdated);
						}
					}
				});
			});

			if (replaced !== this._operands) {
				return new Bitwise(this._operator, <List<Expression>>replaced);
			}
		}
		return this;
	}

	public toString (): string {
		if (this._operands) {
			if (this._operands.count() === 1) {
				return this._operands.get(0).toString();
			}
			return `(${this._operands.map(op => op ? op.toString() : '').join(` ${this._operator} `)})`;
		}
		return ``;
	}
}

export class TooComplexQueryError extends Error {

}

export class QueryNotSupportedError extends Error {

}

export class QuerySyntaxError extends Error {
	
}

export function simplifyBitwiseTree (node: Bitwise): Bitwise {
	if (node.isLeaf || node.operands === undefined) {
		return node;
	}

	let simplified = new Bitwise(node.operator);
	node.operands.forEach(operand => {
		if (operand instanceof Comparison) {
			simplified = simplified.add(operand);
		}
		else if (operand instanceof Bitwise && operand.operator === node.operator) {
			operand = simplifyBitwiseTree(operand);
			if (operand.operands) {
				operand.operands.forEach(operand => {
					simplified = simplified.add(<Expression>operand);
				});
			}
		}
		else if (operand instanceof Bitwise) {
			simplified = simplified.add(simplifyBitwiseTree(operand));
		}
	});

	return simplified;
}

export type Visitor<T> = {
	SelectQuery?: VisitQuery<SelectQuery, VisitMemberSelectQuery<T>, T>,
	UnionQuery?: VisitQuery<UnionQuery, VisitMemberUnionQuery<T>, T>,
	AggregateQuery?: VisitQuery<AggregateQuery, VisitMemberAggregateQuery<T>, T>,
	InsertQuery?: VisitQuery<InsertQuery, VisitMemberInsertQuery<T>, T>,
	UpdateQuery?: VisitQuery<UpdateQuery, VisitMemberUpdateQuery<T>, T>,
	ReplaceQuery?: VisitQuery<ReplaceQuery, VisitMemberReplaceQuery<T>, T>,
	DeleteQuery?: VisitQuery<DeleteQuery, VisitMemberDeleteQuery<T>, T>,
	CreateCollectionQuery?: VisitQuery<CreateCollectionQuery, VisitMemberCreateCollectionQuery<T>, T>,
	DescribeCollectionQuery?: VisitQuery<DescribeCollectionQuery, VisitMemberDescribeCollectionQuery<T>, T>,
	AlterCollectionQuery?: VisitQuery<AlterCollectionQuery, VisitMemberAlterCollectionQuery<T>, T>,
	CollectionExistsQuery?: VisitQuery<CollectionExistsQuery, VisitMemberCollectionExistsQuery<T>, T>,
	DropCollectionQuery?: VisitQuery<DropCollectionQuery, VisitMemberDropCollectionQuery<T>, T>,
	Collection?: (node: Collection) => T,
	Column?: (node: Column) => T,
	Index?: (node: Index) => T,
	Field?: (node: Field) => T,
	SortableField?: (node: SortableField) => T,
	CalcField?: (node: CalcField, members: VisitMemberCalcField<T>) => T,
	CalcFields?: (node: CalcField, members: VisitMemberCalcFields<T>) => T,
	Comparison?: (node: Comparison, members: VisitMemberComparison<T>) => T,
	Comparisons?: (node: Comparison, members: VisitMemberComparisons<T>) => T,
	Bitwise?: (node: Bitwise, members: VisitMemberBitwise<T>) => T
};
export type VisitNode = Query | Collection | Field | SortableField | CalcField | Expression;
export interface VisitQuery<Q, M, T> {
	enter?: (query: Q) => boolean
	leave: (query: Q, members: M) => T
}
export interface VisitMemberSelectQuery<T> {
	select?: Iterable<any, T>
	from?: T
	join?: Iterable<any, {alias: string, on: T, query: T}>
	where?: T
	sort?: Iterable<any, T>
	offset?: number
	limit?: number
}
export interface VisitMemberUnionQuery<T> {
	selects?: Iterable<any, T>
	sort?: Iterable<any, T>
	offset?: number
	limit?: number
}
export interface VisitMemberAggregateQuery<T> {
	select?: Iterable<any, T>
	from?: T
	join?: Iterable<any, { alias: string, on: T, query: T }>
	where?: T
	group?: Iterable<any, T>
	sort?: Iterable<any, T>
	offset?: number
	limit?: number
}
export interface VisitMemberInsertQuery<T> {
	fields?: Iterable<any, T>
	collection?: T
}
export interface VisitMemberUpdateQuery<T> {
	collection?: T
	fields?: Iterable<any, T>
	where?: T
	limit?: number
}
export interface VisitMemberReplaceQuery<T> {
	collection?: T
	fields?: Iterable<any, T>
	where?: T
	limit?: number
}
export interface VisitMemberDeleteQuery<T> {
	collection?: T
	where?: T
	limit?: number
}
export interface VisitMemberCreateCollectionQuery<T> {
	collection?: T
	columns?: Iterable<number, T>
	indexes?: Iterable<number, T>
}
export interface VisitMemberDescribeCollectionQuery<T> {
	collection?: T
}
export interface VisitMemberAlterCollectionQuery<T> {
	collection?: T
	columns?: Iterable<number, T>
}
export interface VisitMemberCollectionExistsQuery<T> {
	collection?: T
}
export interface VisitMemberDropCollectionQuery<T> {
	collection?: T
}
export interface VisitMemberCalcField<T> {
	function: string
	field: T
}
export interface VisitMemberCalcFields<T> {
	function: string
	fields: Iterable<any, any>
}
export interface VisitMemberComparison<T> {
	field: T
	operator: string
	value: any
}
export interface VisitMemberComparisons<T> {
	field: T
	operator: string
	values: Iterable<any, any>
}
export interface VisitMemberBitwise<T> {
	operator: string
	operands: Iterable<number, T>
}

export function visit<T = any>(
	node: VisitNode,
	visitor: Visitor<T>
): T | undefined {

	// Extract the name of the node
	const kind = node.constructor.name;

	if (
		kind === 'SelectQuery' ||
		kind === 'UnionQuery' ||
		kind === 'AggregateQuery' ||
		kind === 'InsertQuery' ||
		kind === 'UpdateQuery' ||
		kind === 'ReplaceQuery' ||
		kind === 'DeleteQuery' ||
		kind === 'CreateCollectionQuery' ||
		kind === 'DescribeCollectionQuery' ||
		kind === 'AlterCollectionQuery' ||
		kind === 'CollectionExistsQuery' ||
		kind === 'DropCollectionQuery'
	) {
		const visitFn: VisitQuery<Query, any, T> | undefined = visitor[kind];
		if (visitFn) {
			// Enter not present or has returned false
			if (!visitFn.enter || visitFn.enter(node) === false) {
				let members: undefined | VisitMemberSelectQuery<T> | VisitMemberUnionQuery<T> | VisitMemberAggregateQuery<T> | VisitMemberInsertQuery<T> | VisitMemberUpdateQuery<T> | VisitMemberReplaceQuery<T> | VisitMemberDeleteQuery<T> | VisitMemberCreateCollectionQuery<T> | VisitMemberDescribeCollectionQuery<T> | VisitMemberAlterCollectionQuery<T> | VisitMemberCollectionExistsQuery<T> | VisitMemberDropCollectionQuery<T>;
				if (node instanceof SelectQuery) {
					members = {
						select: node.getSelect() ? node.getSelect()!.map(field => visit(field!, visitor)!) : undefined,
						from: node.getFrom() ? visit(node.getFrom()!, visitor) : undefined,
						join: node.getJoin() ? node.getJoin()!.map((join, alias) => ({ alias: alias!, on: visit(join!.on, visitor)!, query: visit(join!.query, visitor)! })) : undefined,
						where: node.getWhere() ? visit(node.getWhere()!, visitor) : undefined,
						sort: node.getSort() ? node.getSort()!.map(field => visit(field!, visitor)!) : undefined,
						offset: node.getOffset() ? node.getOffset()! : undefined,
						limit: node.getLimit() ? node.getLimit()! : undefined
					}
				}
				else if (node instanceof UnionQuery) {
					members = {
						selects: node.getSelect() ? node.getSelect()!.map(field => visit(field!, visitor)!) : undefined,
						sort: node.getSort() ? node.getSort()!.map(field => visit(field!, visitor)!) : undefined,
						offset: node.getOffset() ? node.getOffset()! : undefined,
						limit: node.getLimit() ? node.getLimit()! : undefined
					}
				}
				else if (node instanceof AggregateQuery) {
					members = {
						select: node.getSelect() ? node.getSelect()!.map(field => visit(field!, visitor)!) : undefined,
						from: node.getFrom() ? visit(node.getFrom()!, visitor)! : undefined,
						join: node.getJoin() ? node.getJoin()!.map((join, alias) => ({ alias: alias!, on: visit(join!.on, visitor)!, query: visit(join!.query, visitor)! })) : undefined,
						where: node.getWhere() ? visit(node.getWhere()!, visitor)! : undefined,
						group: node.getGroup() ? node.getGroup()!.map(field => visit(field!, visitor)!) : undefined,
						sort: node.getSort() ? node.getSort()!.map(field => visit(field!, visitor)!) : undefined,
						offset: node.getOffset() ? node.getOffset()! : undefined,
						limit: node.getLimit() ? node.getLimit()! : undefined
					}
				}
				else if (node instanceof InsertQuery) {
					members = {
						fields: node.getFields() ? node.getFields()!.map(field => visit(field!, visitor)!) : undefined,
						collection: node.getCollection() ? visit(node.getCollection()!, visitor)! : undefined
					}
				}
				else if (node instanceof UpdateQuery) {
					members = {
						fields: node.getFields() ? node.getFields()!.map(field => visit(field!, visitor)!) : undefined,
						collection: node.getCollection() ? visit(node.getCollection()!, visitor)! : undefined,
						where: node.getWhere() ? visit(node.getWhere()!, visitor)! : undefined,
						limit: node.getLimit() ? node.getLimit()! : undefined
					}
				}
				else if (node instanceof ReplaceQuery) {
					members = {
						fields: node.getFields() ? node.getFields()!.map(field => visit(field!, visitor)!) : undefined,
						collection: node.getCollection() ? visit(node.getCollection()!, visitor)! : undefined,
						where: node.getWhere() ? visit(node.getWhere()!, visitor)! : undefined,
						limit: node.getLimit() ? node.getLimit()! : undefined
					}
				}
				else if (node instanceof DeleteQuery) {
					members = {
						collection: node.getCollection() ? visit(node.getCollection()!, visitor)! : undefined,
						where: node.getWhere() ? visit(node.getWhere()!, visitor)! : undefined,
						limit: node.getLimit() ? node.getLimit()! : undefined
					}
				}
				else if (node instanceof CreateCollectionQuery) {
					members = {
						collection: node.getCollection() ? visit(node.getCollection()!, visitor)! : undefined,
						columns: node.getColumns() ? node.getColumns()!.map(field => visit(field!, visitor)!) : undefined,
						indexes: node.getIndexes() ? node.getIndexes()!.map(field => visit(field!, visitor)!) : undefined
					}
				}
				else if (node instanceof DescribeCollectionQuery || node instanceof CollectionExistsQuery || node instanceof DropCollectionQuery) {
					members = {
						collection: node.getCollection() ? visit(node.getCollection()!, visitor)! : undefined
					}
				}

				if (members) {
					return visitFn.leave(node, members);
				}
			}
		}
	}
	else if (
		kind === 'CountCalcField' ||
		kind === 'AverageCalcField' ||
		kind === 'SumCalcField' ||
		kind === 'SubCalcField'
	) {
		const visitFn = visitor['CalcField'];
		if (visitFn) {
			if (node instanceof CountCalcField || node instanceof AverageCalcField || node instanceof SumCalcField || node instanceof SubCalcField) {
				const members: VisitMemberCalcField<T> = {
					function: node.function.toLocaleUpperCase(),
					field: visit(node.field, visitor)!
				};
				return visitFn(node, members);
			}
		}
	}
	else if (
		kind === 'MaxCalcField' ||
		kind === 'MinCalcField' ||
		kind === 'ConcatCalcField'
	) {
		const visitFn = visitor['CalcFields'];
		if (visitFn) {
			if (node instanceof MaxCalcField || node instanceof MinCalcField || node instanceof ConcatCalcField) {
				const members: VisitMemberCalcFields<T> = {
					function: node.function.toLocaleUpperCase(),
					fields: node.fields.map(field => visit(field!, visitor)!)
				};
				return visitFn(node, members);
			}
		}
	}
	else if (
		kind === 'ComparisonSimple' ||
		kind === 'ComparisonEqual' ||
		kind === 'ComparisonNotEqual' ||
		kind === 'ComparisonGreaterThan' ||
		kind === 'ComparisonGreaterThanOrEqual' ||
		kind === 'ComparisonLesserThan' ||
		kind === 'ComparisonLesserThanOrEqual' ||
		kind === 'ComparisonBeginsWith'
	) {
		const visitFn = visitor['Comparison'];
		if (visitFn) {
			if (node instanceof ComparisonSimple) {
				const members: VisitMemberComparison<T> = {
					field: visit<T>(node.field, visitor)!,
					operator: node.operator,
					value: node.value
				};
				return visitFn(node, members);
			}
		}
	}
	else if (
		kind === 'ComparisonIn'
	) {
		const visitFn = visitor['Comparisons'];
		if (visitFn) {
			if (node instanceof ComparisonIn) {
				const members: VisitMemberComparisons<T> = {
					field: visit(node.field, visitor)!,
					operator: node.operator,
					values: node.values ? node.values.map(val => visit(val!, visitor)) : List()
				};
				return visitFn(node, members);
			}
		}
	}
	else if (
		kind === 'Bitwise'
	) {
		const visitFn = visitor['Bitwise'];
		if (visitFn) {
			if (node instanceof Bitwise) {
				const members: VisitMemberBitwise<T> = {
					operator: node.operator,
					operands: node.operands ? node.operands.map(op => visit(op!, visitor)!) : List()
				};
				return visitFn(node, members);
			}
		}
	}
	else if (
		kind === 'Collection' ||
		kind === 'Column' ||
		kind === 'Index' ||
		kind === 'Field'
	) {
		const visitorFn: ((node: any) => T) | undefined = visitor[kind];
		return visitorFn ? visitorFn(node) : undefined;
	}
	else {
		return node as T;
	}
}