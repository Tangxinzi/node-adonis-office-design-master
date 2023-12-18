"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const Application_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Application"));
const moment_1 = __importDefault(require("moment"));
class ArticleController {
    async index({ request, view, response }) {
        try {
            const all = request.all(), catalog = ['其它', '活动资讯'];
            const articles = await Database_1.default.from('land_articles').select('id', 'article_catalog', 'article_title', 'article_author', 'article_detail', 'article_theme_url', 'article_original_url', 'status', 'created_at').where('status', all.status == 0 ? 0 : 1).forPage(request.input('page', 1), 20);
            for (let index = 0; index < articles.length; index++) {
                articles[index].catalog = catalog[articles[index].article_catalog];
                articles[index]['created_at'] = (0, moment_1.default)(articles[index]['created_at']).format('YYYY-MM-DD H:mm:ss');
            }
            if (all.type == 'json') {
                return response.json({
                    status: 200,
                    message: "ok",
                    data: articles
                });
            }
            return view.render('land/admin/article/index', {
                data: {
                    title: '文章',
                    active: 'article',
                    articles
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
            }
            else {
                var data = await Database_1.default.from('land_articles').select('id', 'article_catalog', 'article_title', 'article_author', 'article_detail', 'article_theme_url', 'article_original_url', 'created_at').where({ status: 1, article_catalog: params.catalog }).orderBy('created_at', 'desc').limit(8);
            }
            for (let index = 0; index < data.length; index++) {
                data[index].created_at = (0, moment_1.default)(data[index].created_at).format('YYYY-MM-DD');
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
    async create({ request, view, session }) {
        try {
            const all = request.all();
            return view.render('land/admin/article/create', {
                data: {
                    title: '创建文章',
                    active: 'article'
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async show({ params, request, view, response }) {
        try {
            const all = request.all();
            const article = await Database_1.default.from('land_articles').where('id', params.id).first();
            article.created_at = (0, moment_1.default)(article.created_at).format('YYYY-MM-DD H:mm:ss');
            const data = {
                status: 200,
                message: "ok",
                data: article
            };
            if (all.type == 'json') {
                return response.json(data);
            }
            return view.render('land/admin/article/edit', {
                data
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async edit({ params, request, view, session }) {
        try {
            const all = request.all();
            const article = await Database_1.default.from('land_articles').where('id', params.id).first();
            return view.render('land/admin/article/edit', {
                data: {
                    title: '编辑文章',
                    active: 'article',
                    article
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
            let article_theme_url = all.theme_url || '';
            if (request.file('theme')) {
                const RandomString = require('RandomString');
                const profile = request.file('theme', { type: ['image', 'video'], size: '10mb' });
                const profileName = `${RandomString.generate(32)}.${profile.extname}`;
                const profilePath = `/uploads/themes/`;
                let file = {};
                file.fileName = profile.clientName;
                file.fileSrc = profilePath + profileName;
                await profile.move(Application_1.default.publicPath(profilePath), { name: profileName, overwrite: true });
                article_theme_url = file.fileSrc;
            }
            if (request.method() == 'POST' && all.button == 'update') {
                await Database_1.default.from('land_articles').where('id', all.id).update({ article_catalog: all.catalog, article_title: all.title, article_author: all.author, article_detail: all.detail, article_original_url: all.original_url, article_theme_url });
                session.flash('message', { type: 'success', header: '更新成功', message: `` });
                return response.redirect('back');
            }
            const id = await Database_1.default.table('land_articles').returning('id').insert({
                article_catalog: all.catalog || '',
                article_title: all.title || '',
                article_author: all.author || '',
                article_detail: all.detail || '',
                article_original_url: all.original_url,
                article_theme_url
            });
            session.flash('message', { type: 'success', header: '创建成功', message: `` });
            return response.redirect('back');
        }
        catch (error) {
            console.log(error);
            session.flash('message', { type: 'error', header: '提交失败', message: `捕获错误信息 ${JSON.stringify(error)}。` });
        }
    }
    async delete({ session, request, response }) {
        try {
            const all = request.all();
            await Database_1.default.from('land_articles').where('id', all.id).update({ status: 0, deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') });
            session.flash('message', { type: 'success', header: '文章已删除成功！', message: `` });
            return response.redirect('back');
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = ArticleController;
//# sourceMappingURL=ArticleController.js.map