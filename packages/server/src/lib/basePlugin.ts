import { Plugin, PluginContext } from './plugin';

export default async function (context: PluginContext): Promise<Plugin> {
	return {
		graphql: `
			scalar Cursor
			scalar Date
			scalar DateTime
			type User @model {
				id: ID!
				username: String! @field(label: "Username", type: "text")
				password: String! @field(label: "Password", type: "password") @permission(group: "noone")
			}
			type File @model {
				id: ID!
				path: String! @field(type: "text")
				name: String! @field(type: "text")
				size: Int! @field(type: "int")
				creation: DateTime! @field(type: "datetime")
				modification: DateTime! @field(type: "datetime")
			}
			type Query {
				me: User!
			}
			type Mutation {
				login(username: String!, password: String!): LoginResponse @permission(group: "nobody")
				logout: LogoutResponse @permission(group: "any")
			}
			type LoginResponse {
				token: String!
			}
			type LogoutResponse {
				acknowledge: Boolean!
			}
		`,
		resolvers: {
			Query: {
				async me() {
					return {
						id: 'needs-an-ID',
						username: 'someone'
					}
				}
			},
			Mutation: {
				async login(parent, { username, password }, { database, cache }) {
					return {
						token: `${username}:${password}`
					};
				},
				async logout(parent, { }, { database, cache }) {
					return {
						acknowledge: true
					};
				}
			}
		}
	}
}