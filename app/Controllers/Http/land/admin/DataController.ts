import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';
import randomstring from 'randomstring';

export default class DataController {
  public async index({ request, view, response }: HttpContextContract) {
    try {
      let datas = (await Database.rawQuery(`
        SELECT
            date_range.date,
            COALESCE(count_land_desginers, 0) AS count_land_desginers,
            COALESCE(count_land_goods, 0) AS count_land_goods,
            COALESCE(count_land_users, 0) AS count_land_users,
            COALESCE(count_land_works, 0) AS count_land_works
        FROM (
            SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m-%d') AS date
            FROM land_desginers
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY AND status = 1

            UNION

            SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m-%d') AS date
            FROM land_goods
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY AND status = 1

            UNION

            SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m-%d') AS date
            FROM land_users
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY

            UNION

            SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m-%d') AS date
            FROM land_works
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY AND status = 1
        ) date_range

        LEFT JOIN (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
                COUNT(*) AS count_land_desginers
            FROM land_desginers
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY
            GROUP BY date
        ) land_desginers_count ON date_range.date = land_desginers_count.date

        LEFT JOIN (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
                COUNT(*) AS count_land_goods
            FROM land_goods
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY
            GROUP BY date
        ) land_goods_count ON date_range.date = land_goods_count.date

        LEFT JOIN (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
                COUNT(*) AS count_land_users
            FROM land_users
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY
            GROUP BY date
        ) land_users_count ON date_range.date = land_users_count.date

        LEFT JOIN (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
                COUNT(*) AS count_land_works
            FROM land_works
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY
            GROUP BY date
        ) land_works_count ON date_range.date = land_works_count.date

        ORDER BY date_range.date;
      `))[0]

      const date = [], count_land_desginers = [], count_land_goods = [], count_land_users = [], count_land_works = []
      for (let index = 0; index < datas.length; index++) {
        date[index] = datas[index].date
        count_land_desginers[index] = datas[index].count_land_desginers
        count_land_goods[index] = datas[index].count_land_goods
        count_land_users[index] = datas[index].count_land_users
        count_land_works[index] = datas[index].count_land_works
      }

      var currentDate = Moment(), dates = [], dataset = {
        date: [],
        desginer: [],
        goods: [],
        users: [],
        works: []
      };

      for (var i = 0; i < 30; i++) {
        dates.push(currentDate.format("YYYY-MM-DD"));
        let indexOf = date.indexOf(dates[i])
        if (indexOf == -1) {
          dataset.date[i] = dates[i]
          dataset.desginer[i] = 0
          dataset.goods[i] = 0
          dataset.users[i] = 0
          dataset.works[i] = 0
        } else {
          dataset.date[i] = dates[i]
          dataset.desginer[i] = count_land_desginers[indexOf]
          dataset.goods[i] = count_land_goods[indexOf]
          dataset.users[i] = count_land_users[indexOf]
          dataset.works[i] = count_land_works[indexOf]
        }
        currentDate = currentDate.subtract(1, 'days');
      }

      dataset = {
        date: dataset.date.reverse(),
        desginer: dataset.desginer.reverse(),
        goods: dataset.goods.reverse(),
        users: dataset.users.reverse(),
        works: dataset.works.reverse(),
        count: {
          user: (await Database.from('land_users').count('* as total'))[0].total || 0,
          desginer: (await Database.from('land_goods').where({ status: 1 }).count('* as total'))[0].total || 0,
          good: (await Database.from('land_goods').where({ status: 1 }).count('* as total'))[0].total || 0,
          work: (await Database.from('land_works').where({ status: 1 }).count('* as total'))[0].total || 0,
          supplier: (await Database.from('land_supplier').count('* as total'))[0].total || 0,
        }
      };

      return view.render('land/admin/data/index', {
        data: {
          title: '数据',
          active: 'data',
          dataset
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
}
