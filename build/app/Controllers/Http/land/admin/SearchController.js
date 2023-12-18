"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
class SearchController {
    async index({ request, view, response }) {
        try {
            let all = request.all(), data = {
                designers: [],
                goods: [],
                works: []
            };
            if (all.search) {
                data.designers = await Database_1.default.from('land_designers').select('id', 'nickname').where({ status: 1 }).where('nickname', 'like', `%${all.search}%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
                data.goods = await Database_1.default.from('land_goods').select('id', 'good_name', 'good_brand').where('status', 1).where('good_name', 'like', `%${all.search}%`).orWhere('good_brand', 'like', `%${all.search}%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
                data.works = await Database_1.default.from('land_works').select('id', 'title', 'introduction', 'theme_url', 'labels').where({ status: 1 }).where('title', 'like', `%${all.search}%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
                data.articles = await Database_1.default.from('land_articles').select('id', 'article_title', 'article_original_url').where({ status: 1 }).where('article_title', 'like', `%${all.search}%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            }
            return response.json({
                status: 200,
                message: "ok",
                data
            });
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = SearchController;
//# sourceMappingURL=SearchController.js.map