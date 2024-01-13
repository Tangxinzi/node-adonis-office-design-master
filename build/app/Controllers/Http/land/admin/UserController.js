"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const moment_1 = __importDefault(require("moment"));
const randomstring_1 = __importDefault(require("randomstring"));
const { jscode2session, token, getUserPhoneNumber } = require('./Weixin');
class UserController {
    async wxLogin({ request, response, view, session }) {
        try {
            const all = request.all();
            const result = await jscode2session(all.code);
            const user = await Database_1.default.from('land_users').where('wechat_open_id', result.openid).first();
            if (user) {
                return user;
            }
            else if (result.openid) {
                const id = await Database_1.default.table('land_users').insert({ nickname: `微信用户_${randomstring_1.default.generate(6)}`, wechat_open_id: result.openid, recommend: all.recommend || '', ip: request.ip() }).returning('id');
                return await Database_1.default.from('land_users').where('id', id[0]).first();
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async index({ request, response, view, session }) {
        try {
            const all = request.all();
            const users = await Database_1.default.from('land_users').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            for (let index = 0; index < users.length; index++) {
                users[index].collection_num = (await Database_1.default.from('land_collection').where({ wechat_open_id: users[index].wechat_open_id, status: 1 }).count('* as total'))[0].total || 0;
                users[index].recommend_num = (await Database_1.default.from('land_users').where({ recommend: users[index].wechat_open_id }).count('* as total'))[0].total || 0;
                if (users[index].recommend) {
                    users[index].recommend = await Database_1.default.from('land_users').where('wechat_open_id', users[index].recommend).first();
                }
                users[index].created_at = (0, moment_1.default)(users[index].created_at).format('YYYY-MM-DD HH:mm:ss');
            }
            return view.render('land/admin/user/index', {
                data: {
                    title: '用户',
                    active: 'user',
                    users,
                    all
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async userinfo({ request, response, view, session }) {
        try {
            const all = request.all();
            if (request.method() == 'GET') {
                const user = await Database_1.default.from('land_users').where('wechat_open_id', all.openid).first();
                if (all.openid) {
                    user.collection_num = (await Database_1.default.from('land_collection').where({ wechat_open_id: all.openid, status: 1 }).count('* as total'))[0].total || 0;
                }
                return user;
            }
            else {
                const result = await jscode2session(all.code);
                await Database_1.default.from('land_users').where('wechat_open_id', result.openid).update({ nickname: all.nickname, avatar_url: all.avatar_url });
                return await Database_1.default.from('land_users').where('wechat_open_id', result.openid).first();
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async collection({ request, response, view, session }) {
        try {
            const all = request.all();
            if (all.type == 'desginer') {
                if (all.search) {
                    var data = await Database_1.default.from('land_collection').join('land_desginers', 'land_collection.relation_type_id', 'land_desginers.id').where({ 'land_collection.type': all.type, 'land_collection.wechat_open_id': all.openid, 'land_collection.status': 1, 'land_desginers.status': 1 }).select('land_desginers.id', 'land_desginers.avatar_url', 'land_desginers.nickname', 'land_desginers.labels').where('land_desginers.title', 'like', `%${all.search}%`).orderBy('land_desginers.created_at', 'desc');
                }
                else {
                    var data = await Database_1.default.from('land_collection').join('land_desginers', 'land_collection.relation_type_id', 'land_desginers.id').where({ 'land_collection.type': all.type, 'land_collection.wechat_open_id': all.openid, 'land_collection.status': 1, 'land_desginers.status': 1 }).select('land_desginers.id', 'land_desginers.avatar_url', 'land_desginers.nickname', 'land_desginers.labels');
                }
            }
            if (all.type == 'work') {
                if (all.search) {
                    var data = await Database_1.default.from('land_collection').join('land_works', 'land_collection.relation_type_id', 'land_works.id').where({ 'land_collection.type': all.type, 'land_collection.wechat_open_id': all.openid, 'land_collection.status': 1, 'land_works.status': 1 }).select('land_works.id', 'land_works.theme_url', 'land_works.title', 'land_works.labels').where('land_works.title', 'like', `%${all.search}%`).orderBy('land_works.created_at', 'desc');
                }
                else {
                    var data = await Database_1.default.from('land_collection').join('land_works', 'land_collection.relation_type_id', 'land_works.id').where({ 'land_collection.type': all.type, 'land_collection.wechat_open_id': all.openid, 'land_collection.status': 1, 'land_works.status': 1 }).select('land_works.id', 'land_works.theme_url', 'land_works.title', 'land_works.labels');
                }
            }
            if (all.type == 'good') {
                if (all.search) {
                    var data = await Database_1.default.from('land_collection').join('land_goods', 'land_collection.relation_type_id', 'land_goods.id').where({ 'land_collection.type': all.type, 'land_collection.wechat_open_id': all.openid, 'land_collection.status': 1, 'land_goods.status': 1 }).select('land_goods.id', 'land_goods.good_theme_url', 'land_goods.good_name', 'land_goods.good_brand').where('land_goods.good_name', 'like', `%${all.search}%`).orderBy('land_goods.created_at', 'desc');
                }
                else {
                    var data = await Database_1.default.from('land_collection').join('land_goods', 'land_collection.relation_type_id', 'land_goods.id').where({ 'land_collection.type': all.type, 'land_collection.wechat_open_id': all.openid, 'land_collection.status': 1, 'land_goods.status': 1 }).select('land_goods.id', 'land_goods.good_theme_url', 'land_goods.good_name', 'land_goods.good_brand');
                }
            }
            for (let index = 0; index < data.length; index++) {
                data[index].good_theme_url = data[index].good_theme_url ? JSON.parse(data[index].good_theme_url) : [];
                data[index].labels = data[index].labels ? data[index].labels.split(',') : [];
            }
            return response.json({ status: 200, message: "ok", data });
        }
        catch (error) {
            console.log(error);
        }
    }
    async getPhoneNumber({ request, response, view, session }) {
        try {
            const all = request.all();
            const result = await token();
            const phone = await getUserPhoneNumber(result.access_token, { code: all.code, openid: all.openid });
            await Database_1.default.from('land_users').where('wechat_open_id', all.openid).update({ phone: phone.phone_info.phoneNumber });
            return response.json({ status: 200, message: "ok", data: phone.phone_info });
        }
        catch (error) {
            console.log(error);
        }
    }
    async calculatorLog({ params, request, response, session }) {
        try {
            const all = request.all();
            return await Database_1.default.table('land_calculator').insert({
                wechat_open_id: all.openid || '',
                count: all.count || '',
                countArea: all.countArea || '',
                estimatedNumber: JSON.stringify(all.estimatedNumber) || '[]',
                multiValue: JSON.stringify(all.multiValue) || '[]',
                area: all.input.area
            });
        }
        catch (error) {
        }
    }
    async like({ params, request, response, session }) {
        try {
            let data = {};
            const all = request.all();
            const coll = await Database_1.default.from('land_collection').where({ wechat_open_id: all.openid, relation_type_id: params.id, type: all.type }).first();
            if (request.method() == 'GET') {
                return response.json({ status: 200, message: "ok", data: coll });
            }
            if (coll && coll.id) {
                data = await Database_1.default.from('land_collection').where({ relation_type_id: params.id }).update({ status: coll.status ? 0 : 1, modified_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') });
            }
            else {
                data = await Database_1.default.table('land_collection').insert({ type: all.type, relation_type_id: params.id, wechat_open_id: all.openid });
            }
            const dataColl = await Database_1.default.from('land_collection').where({ relation_type_id: params.id, type: all.type, status: 1, wechat_open_id: all.openid }).first();
            data = {
                ...data,
                like: dataColl && dataColl.id ? true : false
            };
            response.json({ status: 200, message: "ok", data });
        }
        catch (error) {
            console.log(error);
            response.json({
                status: 500,
                message: "internalServerError",
                data: error
            });
        }
    }
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map