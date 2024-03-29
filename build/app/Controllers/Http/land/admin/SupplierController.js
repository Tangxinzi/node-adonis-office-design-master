"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const Application_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Application"));
const moment_1 = __importDefault(require("moment"));
class SupplierController {
    async login({ params, request, response, view, session }) {
        try {
            if (request.method() == 'POST') {
                const all = request.all();
                if (params.supplier_name_login && all.password) {
                    const supplier = await Database_1.default.from('land_supplier').where({ status: 1, supplier_name_login: params.supplier_name_login, supplier_name_password: all.password }).first() || {};
                    if (supplier.id) {
                        session.put('adonis-cookie-supplier', supplier);
                        return response.redirect().status(301).toRoute('land/admin/SupplierController.index');
                    }
                    else {
                        session.flash('message', { type: 'error', header: '登录失败', message: `请检查您的账号，或者联系管理员处理。` });
                        return response.redirect('back');
                    }
                }
                else {
                    session.forget('adonis-cookie-supplier');
                    return view.render('land/supplier/login', {
                        data: {
                            title: '登录'
                        }
                    });
                }
            }
            else {
                session.forget('adonis-cookie-supplier');
                return view.render('land/supplier/login', {
                    data: {
                        title: '登录'
                    }
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async index({ request, view, response, session }) {
        try {
            const all = request.all(), supplier = session.get('adonis-cookie-supplier');
            const goods = await Database_1.default.from('land_goods').select('*').where({ good_supplier_id: supplier.id }).andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            for (let index = 0; index < goods.length; index++) {
                goods[index].good_theme_url = goods[index].good_theme_url ? JSON.parse(goods[index].good_theme_url) : [];
                goods[index].catalog = await Database_1.default.from('land_goods_catalog').select('*').where({ id: goods[index].good_catalog, status: 1 }).first();
                goods[index].created_at = (0, moment_1.default)(goods[index].created_at).format('YYYY-MM-DD H:mm:ss');
            }
            return view.render('land/supplier/good/index', {
                data: {
                    title: supplier.supplier_name + ' - 供应商商品',
                    goods
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async create({ session, view }) {
        try {
            const supplier = session.get('adonis-cookie-supplier');
            const catalog = await Database_1.default.from('land_goods_catalog').select('*').where({ level: 1, status: 1 }).orderBy('created_at', 'desc');
            for (let index = 0; index < catalog.length; index++) {
                catalog[index].sub_catalog = await Database_1.default.from('land_goods_catalog').select('*').where({ parent_catalog_id: catalog[index].id, level: 2, status: 1 });
            }
            return view.render('land/supplier/good/create', {
                data: {
                    title: supplier.supplier_name + ' - 创建商城商品',
                    catalog
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async edit({ params, request, view, session }) {
        try {
            const all = request.all(), supplier = session.get('adonis-cookie-supplier');
            const good = await Database_1.default.from('land_goods').where({ id: params.id, good_supplier_id: supplier.id }).first() || {};
            good.good_theme_url = good.good_theme_url ? JSON.parse(good.good_theme_url) : [];
            const catalog = await Database_1.default.from('land_goods_catalog').select('*').where({ level: 1, status: 1 }).orderBy('created_at', 'desc');
            for (let index = 0; index < catalog.length; index++) {
                catalog[index].sub_catalog = await Database_1.default.from('land_goods_catalog').select('*').where({ parent_catalog_id: catalog[index].id, level: 2, status: 1 });
            }
            return view.render('land/supplier/good/edit', {
                data: {
                    title: supplier.supplier_name + ' - 编辑商城商品',
                    good,
                    catalog
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async save({ request, response, session }) {
        try {
            let all = request.all(), supplier = session.get('adonis-cookie-supplier');
            const goods = await Database_1.default.from('land_goods').select('*').where({ good_supplier_id: supplier.id, status: 1 }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            if (goods.length > supplier.number) {
                session.flash('message', { type: 'error', header: '提交失败', message: `管理员限制「${supplier.supplier_name}」供应商上传商品数量 ${supplier.number}。` });
                return response.redirect('back');
            }
            if (!all.good_name) {
                session.flash('message', { type: 'error', header: '提交失败', message: `您尚未填写标题，请填写。` });
                return response.redirect('back');
            }
            if (!all.detail) {
                session.flash('message', { type: 'error', header: '提交失败', message: `您尚未填写内容，请填写。` });
                return response.redirect('back');
            }
            let good_theme_url = all.theme_url || [];
            good_theme_url = good_theme_url.filter(item => item !== null && item !== '');
            if (request.file('theme_url')) {
                const themes = request.files('theme_url', {
                    types: ['image'],
                    size: '2mb'
                });
                for (let index = 0; index < themes.length; index++) {
                    let theme = themes[index];
                    if (!theme.extname) {
                        console.log(theme);
                        session.flash('message', { type: 'error', header: '上传错误', message: `上传图片格式遇到问题。` });
                        return response.redirect('back');
                    }
                    let randomstring = require('randomstring');
                    const profileName = `${randomstring.generate(32)}.${theme.extname}`;
                    const profilePath = `/uploads/supplier/themes/`;
                    let file = {
                        fileName: theme.clientName,
                        fileSrc: profilePath + profileName
                    };
                    await theme.move(Application_1.default.publicPath(profilePath), { name: profileName, overwrite: true });
                    good_theme_url[good_theme_url.length + index] = file.fileSrc;
                }
            }
            if (request.method() == 'POST' && all.button == 'update') {
                await Database_1.default.from('land_goods').where('id', all.id).update({
                    good_supplier_id: supplier.id,
                    good_catalog: all.good_catalog || '',
                    good_name: all.good_name,
                    good_brand: all.good_brand,
                    detail: all.detail,
                    good_theme_url: JSON.stringify(good_theme_url)
                });
                session.flash('message', { type: 'success', header: '更新成功', message: `` });
                return response.redirect().toRoute('land/admin/SupplierController.edit', { id: all.id });
            }
            const id = await Database_1.default.table('land_goods').returning('id').insert({
                status: 0,
                good_supplier_id: supplier.id,
                good_catalog: all.good_catalog || '',
                good_name: all.good_name || '',
                good_brand: all.good_brand || '',
                detail: all.detail || '',
                good_theme_url: JSON.stringify(good_theme_url)
            });
            session.flash('message', { type: 'success', header: '创建成功', message: `` });
            return response.redirect().toRoute('land/admin/SupplierController.edit', { id: id });
        }
        catch (error) {
            console.log(error);
            session.flash('message', { type: 'error', header: '提交失败', message: `捕获错误信息 ${JSON.stringify(error)}。` });
            return response.redirect('back');
        }
    }
    async delete({ session, request, response }) {
        try {
            const all = request.all(), supplier = session.get('adonis-cookie-supplier');
            if (all.button == 'good') {
                await Database_1.default.from('land_goods').where('id', all.id).update({ good_supplier_id: supplier.id, status: 0, deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') });
                session.flash('message', { type: 'success', header: '商城商品已删除成功！', message: `` });
            }
            if (all.button == 'catalog') {
                await Database_1.default.from('land_goods_catalog').where('id', all.id).update({ good_supplier_id: supplier.id, status: 0, deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') });
                session.flash('message', { type: 'success', header: '商城商品已删除成功！', message: `` });
            }
            return response.redirect('back');
        }
        catch (error) {
            console.log(error);
        }
    }
    async supplier({ view, session, request, response }) {
        try {
            const all = request.all();
            const supplier = await Database_1.default.from('land_supplier').select('*').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20);
            for (let index = 0; index < supplier.length; index++) {
                supplier[index].created_at = (0, moment_1.default)(supplier[index].created_at).format('YYYY-MM-DD H:mm:ss');
            }
            return view.render('land/admin/good/supplier', {
                data: {
                    title: '供应商',
                    active: 'supplier',
                    supplier
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = SupplierController;
//# sourceMappingURL=SupplierController.js.map