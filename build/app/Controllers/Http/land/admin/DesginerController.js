"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const Application_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Application"));
const moment_1 = __importDefault(require("moment"));
const randomstring_1 = __importDefault(require("randomstring"));
class DesginerController {
    async manage({ session, request, response, view }) {
        try {
            const all = request.all();
            const manages = await Database_1.default.from('land_desginers_manage').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            for (let index = 0; index < manages.length; index++) {
                manages[index].desginer = await Database_1.default.from('land_desginers').select('nickname').where({ status: 1, id: manages[index].relation_desginer_id }).first() || {};
                manages[index].number = (await Database_1.default.from('land_works').where({ status: 1, relation_desginer_id: manages[index].relation_desginer_id }).count('* as total'))[0].total || 0;
                manages[index].created_at = (0, moment_1.default)(manages[index].created_at).format('YYYY-MM-DD H:mm:ss');
            }
            return view.render('land/admin/desginer/manages', {
                data: {
                    title: '设计师管理',
                    active: 'desginer',
                    manages,
                    all
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async index({ request, response, view, session }) {
        try {
            const all = request.all(), catalog = ['其它', '设计团队', '工程管理团队'];
            const desginers = await Database_1.default.from('land_desginers').where('status', all.status == 0 ? 0 : 1).andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            for (let index = 0; index < desginers.length; index++) {
                desginers[index].works = await Database_1.default.from('land_works').where({ status: 1, relation_desginer_id: desginers[index].id }).andWhereNull('deleted_at').orderBy('created_at', 'desc');
                desginers[index].labels = desginers[index].labels ? desginers[index].labels.split(',') : [];
                desginers[index].catalog = catalog[desginers[index].catalog];
                desginers[index].created_at = (0, moment_1.default)(desginers[index].created_at).format('YYYY-MM-DD H:mm:ss');
            }
            if (all.type == 'json') {
                const desginers = await Database_1.default.from('land_desginers').where('status', 1).andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 8);
                for (let index = 0; index < desginers.length; index++) {
                    desginers[index].works = await Database_1.default.from('land_works').where({ status: 1, relation_desginer_id: desginers[index].id }).andWhereNull('deleted_at').orderBy('created_at', 'desc');
                    desginers[index].labels = desginers[index].labels ? desginers[index].labels.split(',') : [];
                    desginers[index].catalog = catalog[desginers[index].catalog];
                    desginers[index].created_at = (0, moment_1.default)(desginers[index].created_at).format('YYYY-MM-DD H:mm:ss');
                }
                return response.json({
                    status: 200,
                    message: "ok",
                    data: desginers
                });
            }
            return view.render('land/admin/desginer/index', {
                data: {
                    title: '设计师',
                    active: 'desginer',
                    desginers,
                    all
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async create({ request, view, session }) {
        try {
            const all = request.all();
            return view.render('land/admin/desginer/create', {
                data: {
                    title: '创建设计师',
                    active: 'desginer',
                    works: await Database_1.default.table('land_works')
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async catalog({ params, request, view, response }) {
        try {
            const all = request.all();
            if (all.search) {
                var data = await Database_1.default.from('land_desginers').where({ status: 1, catalog: params.catalog }).where('nickname', 'like', `%${all.search}%`).andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 8);
            }
            else {
                var data = await Database_1.default.from('land_desginers').where({ status: 1, catalog: params.catalog }).andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 8);
            }
            for (let index = 0; index < data.length; index++) {
                data[index].labels = data[index].labels ? data[index].labels.split(',') : [];
            }
            if (all.type == 'json') {
                return response.json({
                    status: 200,
                    message: "ok",
                    data
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async show({ params, request, view, response }) {
        try {
            const all = request.all();
            const data = await Database_1.default.from('land_desginers').where('id', params.id).first();
            data.labels = data.labels ? data.labels.split(',') : [];
            data.works = await Database_1.default.from('land_works').select('id', 'title', 'labels', 'theme_url').where({ status: 1, relation_desginer_id: data.id }).andWhereNull('deleted_at');
            if (all.type == 'json') {
                return response.json({
                    status: 200,
                    message: "ok",
                    data
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async edit({ params, request, view, session }) {
        try {
            const all = request.all();
            return view.render('land/admin/desginer/edit', {
                data: {
                    title: '编辑设计师',
                    active: 'desginer',
                    works: await Database_1.default.table('land_works'),
                    desginer: await Database_1.default.from('land_desginers').where('id', params.id).first()
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async save({ request, response, session }) {
        try {
            let all = request.all();
            let avatar_url = all.avatar_url || '';
            if (request.file('avatar')) {
                const profile = request.file('avatar', { type: ['image'], size: '2mb' });
                const profileName = `${randomstring_1.default.generate(32)}.${profile.extname}`;
                const profilePath = `/uploads/avatars/`;
                let file = {};
                file.fileName = profile.clientName;
                file.fileSrc = profilePath + profileName;
                await profile.move(Application_1.default.publicPath(profilePath), { name: profileName, overwrite: true });
                avatar_url = file.fileSrc;
            }
            if (request.method() == 'POST' && all.button == 'update') {
                await Database_1.default.from('land_desginers').where('id', all.id).update({ status: all.status, catalog: all.catalog, nickname: all.nickname, labels: all.labels, detail: all.detail, avatar_url });
                session.flash('message', { type: 'success', header: '更新成功', message: `` });
                return response.redirect('back');
            }
            const id = await Database_1.default.table('land_desginers').returning('id').insert({
                status: all.status,
                catalog: all.catalog,
                nickname: all.nickname,
                labels: all.labels,
                detail: all.detail,
                avatar_url
            });
            session.flash('message', { type: 'success', header: '创建成功', message: `` });
            return response.redirect('back');
        }
        catch (error) {
            console.log(error);
            session.flash('message', { type: 'error', header: '提交失败', message: `捕获错误信息 ${JSON.stringify(error)}。` });
        }
    }
    async desginerSave({ view, session, request, response }) {
        try {
            const all = request.all(), data = session.get('adonis-cookie-desginer');
            switch (all.button) {
                case 'add':
                    await Database_1.default.table('land_desginers_manage').insert({
                        relation_desginer_id: all.relation_desginer_id,
                        desginer_name_login: all.desginer_name_login,
                        desginer_name_password: all.desginer_name_password,
                        status: parseInt(all.status || 0),
                    });
                    break;
                case 'save':
                    await Database_1.default.from('land_desginers_manage').where({ id: all.id }).update({
                        relation_desginer_id: all.relation_desginer_id,
                        desginer_name_login: all.desginer_name_login,
                        desginer_name_password: all.desginer_name_password,
                        status: parseInt(all.status || 0),
                    });
                    break;
                case 'delete':
                    await Database_1.default.from('land_desginers_manage').where({ id: all.id }).update({ status: 0, deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') });
                    break;
            }
            session.flash('message', { type: 'success', header: '操作成功', message: `` });
            return response.redirect('back');
        }
        catch (error) {
            console.log(error);
        }
    }
    async delete({ session, request, response }) {
        try {
            const all = request.all();
            await Database_1.default.from('land_desginers').where('id', all.id).update({ status: 0, deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') });
            session.flash('message', { type: 'success', header: '设计师已删除成功！', message: `` });
            return response.redirect('back');
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = DesginerController;
//# sourceMappingURL=DesginerController.js.map