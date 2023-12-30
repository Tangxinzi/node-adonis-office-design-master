"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const moment_1 = __importDefault(require("moment"));
class CalculatorController {
    async index({ request, view, response }) {
        try {
            const all = request.all();
            if (all.user_id) {
                var calculator = await Database_1.default.from('land_calculator').where({ wechat_open_id: all.user_id }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            }
            else {
                var calculator = await Database_1.default.from('land_calculator').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            }
            for (let index = 0; index < calculator.length; index++) {
                calculator[index].estimatedNumber = JSON.parse(calculator[index].estimatedNumber);
                calculator[index].user = await Database_1.default.from('land_users').where({ wechat_open_id: calculator[index].wechat_open_id }).first() || {};
                calculator[index].created_at = (0, moment_1.default)(calculator[index].created_at).format('YYYY-MM-DD H:mm:ss');
            }
            return view.render('land/admin/calculator/index', {
                data: {
                    title: '计算器',
                    active: 'calculator',
                    calculator,
                    all
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = CalculatorController;
//# sourceMappingURL=CalculatorController.js.map