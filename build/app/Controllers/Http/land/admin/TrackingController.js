"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('zh-cn');
class TrackingController {
    async eventTracking({ request, response, view, session }) {
        try {
            const all = request.all();
            const tracking = await Database_1.default.from('land_tracking').where({ type: 'odm' }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            for (let index = 0; index < tracking.length; index++) {
                tracking[index].content = JSON.parse(tracking[index].content);
                tracking[index].created_at = (0, moment_1.default)(tracking[index].created_at).format('YYYY-MM-DD HH:mm:ss');
            }
            return view.render('land/admin/event-tracking/odm', {
                data: {
                    title: '[ODM] 营销表单信息流程',
                    active: 'odm',
                    tracking,
                    all
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async odm({ request, response, session }) {
        try {
            const all = request.all();
            console.log(all);
            const id = await Database_1.default.table('land_tracking').insert({
                type: 'odm',
                content: JSON.stringify(all)
            });
            if (id.length) {
                response.json({ status: 200, message: "ok" });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = TrackingController;
//# sourceMappingURL=TrackingController.js.map