/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { OverlayTemplate } from 'klinecharts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const extendedHoursHighlight: OverlayTemplate = {
  name: 'extendedHoursHighlight',
  lock: true,
  // @ts-ignore
  zLevel: -1,
  createPointFigures: (params) => {
    const { overlay, bounding, barSpace, xAxis } = params
    if (xAxis === null) {
      return []
    }
    const figures: any[] = []
    const extendData = overlay.extendData || {}
    const preMarketColor = extendData.preMarketColor ?? 'rgba(0, 150, 255, 0.05)'
    const afterMarketColor = extendData.afterMarketColor ?? 'rgba(255, 165, 0, 0.05)'
    const getDataList = extendData.getDataList
    if (!getDataList) {
      return []
    }

    const dataList = getDataList()
    const startIndex = Math.max(0, Math.floor(xAxis.convertFromPixel(0)))
    const endIndex = Math.min(dataList.length - 1, Math.ceil(xAxis.convertFromPixel(bounding.width)))
    const visibleDataList = dataList.slice(startIndex, endIndex + 1)

    const getSession = (timestamp: number) => {
      const nyTime = dayjs(timestamp)
      const hour = nyTime.hour()
      const minute = nyTime.minute()
      const totalMinutes = hour * 60 + minute

      if (totalMinutes >= 4 * 60 && totalMinutes < 9 * 60 + 30) {
        return 'pre'
      }
      if (totalMinutes >= 16 * 60 && totalMinutes < 20 * 60) {
        return 'after'
      }
      return ''
    }

    let currentSession = ''
    let startX = 0

    visibleDataList.forEach((data: any, index: number) => {
      const session = getSession(data.timestamp)
      const x = xAxis.convertToPixel(startIndex + index)
      const halfBarSpace = barSpace.halfBar

      if (session !== currentSession) {
        if (currentSession) {
          const endX = x - halfBarSpace
          figures.push({
            type: 'rect',
            attrs: {
              x: startX,
              y: 0,
              width: endX - startX,
              height: bounding.height
            },
            styles: {
              color: currentSession === 'pre' ? preMarketColor : afterMarketColor
            }
          })
        }
        currentSession = session
        startX = x - halfBarSpace
      }

      if (index === visibleDataList.length - 1 && currentSession) {
        const endX = x + halfBarSpace
        figures.push({
          type: 'rect',
          attrs: {
            x: startX,
            y: 0,
            width: endX - startX,
            height: bounding.height
          },
          styles: {
            color: currentSession === 'pre' ? preMarketColor : afterMarketColor
          }
        })
      }
    })

    return figures
  }
}

export default extendedHoursHighlight
