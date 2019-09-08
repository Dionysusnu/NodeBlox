const Base = require('./Base');
const Collection = require('./Collection');
const GroupMember = require('./GroupMember');
const Shout = require('./Shout');
const User = require('./User');

module.exports = class Group extends Base {
	constructor(client, data) {
		super(client);
		Object.defineProperty(this, 'id', { value: data.id });
		Object.defineProperty(this, 'name', { value: data.name });
		this.description = data.description;
		const owner = client.users.get(data.owner.userId);
		owner && owner.update(data.owner);
		this.owner = owner || new User(client, data.owner);
		this.shout = data.shout && new Shout(data.shout);
		this.memberCount = data.memberCount;
		this.isBuildersClubOnly = data.isBuildersClubOnly;
		this.hasClan = data.hasClan;
		this.public = data.publicEntryAllowed;
		this.locked = data.isLocked;
		this.roles = new Collection();
		client.groups.set(this.id, this);
	}

	update(data) {
		this.description = data.description;
		this.owner = this.client.users.get(data.owner.userId) || new User(this.client, data.owner);
		this.shout = data.shout && new Shout(data.shout);
		this.memberCount = data.memberCount;
		this.isBuildersClubOnly = data.isBuildersClubOnly;
		this.hasClan = data.hasClan;
		this.public = data.publicEntryAllowed;
		this.locked = data.isLocked;
	}

	async getUsers() {
		const url = 'https://groups.roblox.com/v1/groups/' + this.id + '/users';
		const initialResponse = await this.client.http(url, {
			params: {
				limit: 100,
			},
		});
		let nextCursor = initialResponse.data.nextPageCursor;
		const responseMembers = [];
		for (const user of initialResponse.data.data) {
			responseMembers.push(new GroupMember(this.client, user, this));
		}
		while (nextCursor) {
			const response = await this.client.http(url, { params: {
				cursor: nextCursor,
				limit: 100,
			},
			});
			nextCursor = response.data.nextPageCursor;
			for (const user of response.data.data) {
				responseMembers.push(new GroupMember(this.client, user, this));
			}
		}
		this.members = new Collection(this.client, responseMembers);
		return this.members;
	}
};
