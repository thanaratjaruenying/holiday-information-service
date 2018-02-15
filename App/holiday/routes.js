import moment from 'moment'
import _ from 'lodash'
import superagent from 'superagent'

export function setup(router) {
  router.all('/', (req, res, next) => res.send('Holiday API'))

  router.get('/same_holiday', async (req, res, next) => {
    const HolidayAPI = 'https://holidayapi.com/v1/holidays'
    const {first_country, second_country, date} = req.query
    const firstCountry = first_country.toUpperCase()
    const secondCountry = second_country.toUpperCase()
    const validateDate = moment(date).format('YYYY-MM-DD')
    if (validateDate === 'Invalid date') {
      res.status(400).json({error: 'Invalid date'})
      return
    }

    const newDate = moment(date, 'YYYY-MM-DD')
    const year = newDate.year()
    const month = newDate.month() + 1
    const day = newDate.date()
    const parameter1 = {
      key: process.env.HOLIDAYAPI_KEY,
      country: firstCountry,
      year,
      month,
      day,
      upcoming: true,
    }
    const parameter2 = {
      key: process.env.HOLIDAYAPI_KEY,
      country: secondCountry,
      year,
      month,
      day,
      upcoming: true,
    }

    let result1, result2;
    try {
      result1 = await superagent.get(HolidayAPI).query(parameter1)
      result2 = await superagent.get(HolidayAPI).query(parameter2)
    } catch (error) {
      const {response} = error
      const text = JSON.parse(response.text)
      res.status(response.status).json(text)
      return
    }

    const holidays1 = JSON.parse(result1.text).holidays
    const holidays2 = JSON.parse(result2.text).holidays

    const dateOfHoliday1 = Object.keys(holidays1)
    const dateOfHoliday2 = Object.keys(holidays2)
    const equalsDate = _.intersection(dateOfHoliday1, dateOfHoliday2)
    const re1 = equalsDate.map(date => holidays1[date])
    const re2 = equalsDate.map(date => holidays2[date])

    res.json({
      date: `${year}-${month}-${day}`,
      [firstCountry]: _.flattenDeep(re1),
      [secondCountry]: _.flattenDeep(re2)
    })

  })
}
