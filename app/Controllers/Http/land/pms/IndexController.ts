import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';
import randomstring from 'randomstring';

export default class IndexController {
  public async index({ request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      return view.render('land/pms/index/index', {
        data: {
          title: '项目管理',
          all
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async create({ params, request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      console.log(all);
      
      // session.flash('message', { type: 'success', header: '更新成功', message: `` })
      // return response.redirect().toRoute('land/pms/IndexController.steps', { id: params.id, step: params.step })
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

      return view.render('land/pms/index/steps', {
        data: {
          title: '编辑项目',
          step: params.step,
          all,
          id: '0000',
          ...dataset
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
}
