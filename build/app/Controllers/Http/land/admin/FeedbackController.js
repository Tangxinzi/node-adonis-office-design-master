"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const moment_1 = __importDefault(require("moment"));
class FeedbackController {
    async index({ request, view, response }) {
        try {
            const all = request.all();
            const feedbacks = await Database_1.default.from('land_feedbacks').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            for (let index = 0; index < feedbacks.length; index++) {
                feedbacks[index].user = await Database_1.default.from('land_users').where('wechat_open_id', feedbacks[index].wechat_open_id).first() || {};
                feedbacks[index].contact = feedbacks[index].contact ? JSON.parse(feedbacks[index].contact) : {};
                feedbacks[index].detail = feedbacks[index].detail ? JSON.parse(feedbacks[index].detail) : {};
                feedbacks[index].created_at = (0, moment_1.default)(feedbacks[index].created_at).format('YYYY-MM-DD H:mm:ss');
            }
            return view.render('land/admin/feedback/index', {
                data: {
                    title: '咨询反馈',
                    active: 'feedback',
                    feedbacks,
                    all
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async save({ params, request, response, session }) {
        try {
            const all = request.all();
            return response.json({
                status: 200,
                message: "ok",
                data: await Database_1.default.table('land_feedbacks').insert({
                    wechat_open_id: all.openid || '',
                    contact: JSON.stringify({
                        name: all.name || '',
                        number: all.number || '',
                        email: all.email || '',
                        wechat: all.wechat || '',
                        qq: all.qq || ''
                    }) || '{}',
                    detail: JSON.stringify({
                        city: all.city || '',
                        area: all.area || '',
                        content: all.content || ''
                    }) || '{}'
                })
            });
        }
        catch (error) {
        }
    }
}
exports.default = FeedbackController;
//# sourceMappingURL=FeedbackController.js.map