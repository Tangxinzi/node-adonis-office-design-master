import Database from '@ioc:Adonis/Lucid/Database'
import Moment from 'moment'
Moment.locale('zh-cn')

export default class TrackingController {
  public async eventTrackingID({ request, response, view, session }: HttpContextContract) {
    try {
      const tracking = await Database.from('tracking').where({ type: 'information-improvement-process' })
      for (let index = 0; index < tracking.length; index++) {
        tracking[index].content = JSON.parse(tracking[index].content)
        tracking[index].content.type = tracking[index].content.type == 'users' ? '创建用户' : '介绍好友'
        tracking[index].created_at = Moment(tracking[index].created_at).format('YYYY-MM-DD HH:mm:ss')
        tracking[index].content.itemStayValue = {
          userType: {},
          userAvatarNick: {},
          userSex: {},
          userHeight: {},
          userBirthday: {},
          userWork: {},
          userPhotos: {},
          userSchool: {},
          userCompany: {},
          userJobTitle: {}
        }

        for (let typeIndex = 0; typeIndex < tracking[index].content.itemStayType.length; typeIndex++) {
          switch (tracking[index].content.itemStayType[typeIndex]) {
            case 'userType':
              tracking[index].content.itemStayValue.userType = {
                text: '角色',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userAvatarNick':
              tracking[index].content.itemStayValue.userAvatarNick = {
                text: '头像',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userSex':
              tracking[index].content.itemStayValue.userSex = {
                text: '性别',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userHeight':
              tracking[index].content.itemStayValue.userHeight = {
                text: '身高',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userBirthday':
              tracking[index].content.itemStayValue.userBirthday = {
                text: '生日',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userSchool':
              tracking[index].content.itemStayValue.userSchool = {
                text: '学校',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userCompany':
              tracking[index].content.itemStayValue.userCompany = {
                text: '公司',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userJobTitle':
              tracking[index].content.itemStayValue.userJobTitle = {
                text: '职位',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userWork':
              tracking[index].content.itemStayValue.userWork = {
                text: '职业',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            case 'userPhotos':
              tracking[index].content.itemStayValue.userPhotos = {
                text: '照片',
                time: tracking[index].content.itemStayTime[typeIndex]
              }
              break;
            default:

          }

          // tracking[index].content.itemStayValue[typeIndex] = {
          //   text,
          //   type: tracking[index].content.itemStayType[typeIndex],
          //   time: tracking[index].content.itemStayTime[typeIndex],
          // }
        }

        delete tracking[index].content.itemStayType, delete tracking[index].content.itemStayTime
      }

      // return tracking

      return view.render('admin/event-tracking/information-improvement-process', {
        data: {
          title: '[IIP] 信息完善流程',
          active: 'datas',
          tracking
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  public async informationImprovementProcess({ request, response, session }: HttpContextContract) {
    try {
      const all = request.all()   
      console.log(all);
         
      const id = await Database.table('tracking').insert({ 
        type: 'odm', 
        content: JSON.stringify(all) 
      })

      if (id.length) {
        response.json({ status: 200, message: "ok" })
      }
    } catch (error) {
      console.log(error);
    }
  }
}
