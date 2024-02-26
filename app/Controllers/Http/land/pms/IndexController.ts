import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';

export default class IndexController {
  public async index({ request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      const products = await Database.from('land_products').andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      return view.render('land/pms/index/index', {
        data: {
          title: '项目管理',
          all,
          products
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async save({ params, request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all()

      if (all.button == 'create') {
        const product_id = uuidv4()
        await Database.table('land_products').insert({
          product_id, // 项目 ID
          serial: all.serial, // 编号
          name: all.name, // 名称
          address: all.address, // 地址
          area: all.area, // 面积
          budget: all.budget, // 预算造价
          value01: all.value01, // 毛坯 / 遗留装修
          value02: all.value02, // 建筑层高
          value03: all.value03, // 梁底高度
          value04: all.value04, // 地面距离地面高度
          value05: all.value05, // 完成面高度
          date_start: all.date_start, // 项目启动日期
          date_end: all.date_end, // 项目进度 / 设计提交时间
          description: all.description,
        })

        session.flash('message', { type: 'success', header: '创建成功', message: `${ all.name }项目已创建。` })
      }

      if (all.button == 'update') {
        await Database.from('land_products').where('product_id', all.product_id).update({
          serial: all.serial, // 编号
          name: all.name, // 名称
          address: all.address, // 地址
          area: all.area, // 面积
          budget: all.budget, // 预算造价
          value01: all.value01, // 毛坯 / 遗留装修
          value02: all.value02, // 建筑层高
          value03: all.value03, // 梁底高度
          value04: all.value04, // 地面距离地面高度
          value05: all.value05, // 完成面高度
          date_start: all.date_start, // 项目启动日期
          date_end: all.date_end, // 项目进度 / 设计提交时间
          description: all.description,
        })

        session.flash('message', { type: 'success', header: '更新成功', message: `${ all.name }项目信息已更新。` })
      }

      if (all.button == 'OfficeSpaceDemandStatistics') {
        await Database.from('land_products_osds').where('product_id', all.product_id).update({
          number_1: all.number_1,
          number_2: all.number_2,
          number_3: all.number_3,
          number_4: all.number_4,
          number_5: all.number_5,
          number_6: all.number_6,
          number_7: all.number_7,
          number_8: all.number_8,
          number_9: all.number_9,
          number_10: all.number_10,
          number_11: all.number_11,
          number_12: all.number_12,
          number_13: all.number_13,
          number_14: all.number_14,
          number_15: all.number_15,
          number_16: all.number_16,
          number_17: all.number_17,
          number_18: all.number_18,
          number_19: all.number_19,
          number_20: all.number_20,
          number_21: all.number_21,
          number_22: all.number_22,
          number_23: all.number_23,
          number_24: all.number_24,
          number_25: all.number_25,
          number_26: all.number_26,
          number_27: all.number_27,
        })

        session.flash('message', { type: 'success', header: '更新成功', message: `办公空间需求统计信息已更新。` })
      }

      return response.redirect('back')
    } catch (error) {
      console.log(error)
    }
  }

  public async steps({ params, request, response, view, session }: HttpContextContract) {
    try {
      let all = request.all(), dataset = {
        information_documents: []
      }
      const product = await Database.from('land_products').where('product_id', params.id).andWhereNull('deleted_at').first() || {}
      const land_products_osds = await Database.from('land_products_osds').where('product_id', params.id).andWhereNull('deleted_at').first() || {}

      switch (params.step) {
        case 'step-04':
          dataset.information_documents = [
            {
              file: '项目周报',
              description: '文件描述',
              date: '2024-01-01'
            },
            {
              file: '项目例会纪要',
              description: '文件描述',
              date: '2024-01-01'
            },
            {
              file: '隐蔽验收单',
              description: '文件描述',
              date: '2024-01-01'
            },
            {
              file: '设计变更通知',
              description: '文件描述',
              date: '2024-01-01'
            },
            {
              file: '工程洽商记录',
              description: '文件描述',
              date: '2024-01-01'
            },
            {
              file: '竣工验收单及整改单',
              description: '文件描述',
              date: '2024-01-01'
            },
            {
              file: '签证单、签证执行单',
              description: '文件描述',
              date: '2024-01-01'
            }
          ]
          break;

        default:
          break;
      }

      if (all.type == 'json') {
        return response.json({
          status: 200,
          message: "ok",
          data: {
            step: params.step,
            product,
            land_products_osds,
            ...dataset
          }
        })
      }

      return view.render('land/pms/index/steps', {
        data: {
          title: '编辑项目',
          all,
          step: params.step,
          product,
          land_products_osds,
          ...dataset
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
}
