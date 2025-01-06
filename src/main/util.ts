import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'
import { app } from 'electron'
import { musicList } from '../../resources/data/musicList'

interface MoodQuote {
  id: number
  content: string
}

interface MusicItem {
  id: number
  title: string
  colors: string[]
  ytUrl: string
  wavUrl: string
}
export async function downloadFile(url: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath)
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`))
          return
        }

        response.pipe(file)

        // 檢查響應流是否出現錯誤
        response.on('error', (err) => {
          fs.unlink(outputPath, () => {})
          reject(new Error(`下載時出現錯誤: ${err.message}`))
        })

        // 使用 close 事件確保文件完全寫入磁碟
        file.on('finish', () => {
          file.close(() => {
            const fileSize = fs.statSync(outputPath).size
            console.log(`下載完成，文件大小: ${fileSize} bytes`)
            resolve(outputPath)
          })
        })
      })
      .on('error', (err) => {
        fs.unlink(outputPath, () => {})
        reject(err)
      })
  })
}

export async function getAudioFile(fileName: string): Promise<string | null> {
  try {
    const audioDir = path.join(app.getPath('desktop'), 'audio')
    const filePath = path.join(audioDir, fileName)

    // 檢查檔案是否存在
    if (!fs.existsSync(filePath)) {
      console.log('找不到檔案，正在尋找下載來源')
      const musicId = parseInt(fileName.replace('song_', '').replace('.wav', ''))
      const musicInfo = musicList.find((music) => music.id === musicId)

      if (!musicInfo) {
        console.log('找不到音樂資訊')
        throw new Error(`Music info not found for ID: ${musicId}`)
      }
      // 確保下載目錄存在
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true })
      }
      // 下載檔案
      console.log(`下載檔案: ${fileName}`)
      await downloadFile(musicInfo.wavUrl, filePath)
      console.log(`下載完成: ${fileName}`)
    }

    // 讀取並回傳檔案
    console.log('讀取檔案:', filePath)
    const fileData = fs.readFileSync(filePath)
    return `data:audio/wav;base64,${fileData.toString('base64')}`
  } catch (error) {
    console.error('Error in getAudioFile:', error)
    return null
  }
}

export async function moodCsvToJson(): Promise<void> {
  try {
    // 取得檔案路徑
    const appRootPath = app.getAppPath()
    const csvPath = path.join(appRootPath, 'resources', 'quotesList.csv')
    const tsOutputPath = path.join(appRootPath, 'resources', 'data', 'quotesList.ts')

    // 讀取 CSV 檔案
    const csvData = await fs.promises.readFile(csvPath, 'utf-8')

    // 解析 CSV 數據
    const lines = csvData
      .split('\n')
      .filter((line) => line.trim()) // 移除空行
      .slice(1) // 移除標題行（如果有的話）

    // 轉換成物件陣列
    const quotes: MoodQuote[] = lines.map((line) => {
      const [id, content] = line.split(',').map((item) => item.trim())
      return {
        id: parseInt(id),
        content: content.replace(/^["']|["']$/g, '') // 移除引號（如果有的話）
      }
    })

    // 生成 TypeScript 程式碼
    const tsContent = `// This file is auto-generated from CSV. Do not edit   manually.
    export interface MoodQuote {
      id: number
      content: string
    }

    export const moodList: MoodQuote[] = ${JSON.stringify(quotes, null, 2)}

    export const getMoodQuoteById = (id: number): MoodQuote | undefined => {
      return moodList.find(quote => quote.id === id)
    }

    export const getRandomMoodQuote = (): MoodQuote => {
      const randomIndex = Math.floor(Math.random() * moodList.length)
      return moodList[randomIndex]
    }
      
    `

    // 確保輸出目錄存在
    const outputDir = path.dirname(tsOutputPath)
    if (!fs.existsSync(outputDir)) {
      await fs.promises.mkdir(outputDir, { recursive: true })
    }

    // 寫入 TypeScript 檔案
    await fs.promises.writeFile(tsOutputPath, tsContent, 'utf-8')

    console.log('Successfully converted CSV to TypeScript file!')
  } catch (error) {
    console.error('Error converting CSV to TypeScript:', error)
    throw error
  }
}

export async function musicCsvToJson() {
  try {
    // 使用 app.getAppPath() 來獲取應用程式的根目錄
    const appRootPath = app.getAppPath()
    const csvFilePath = path.join(appRootPath, 'resources', 'musicList.csv')
    //resourse/data/musicList.ts
    const tsOutputPath = path.join(appRootPath, 'resources', 'data', 'musicList.ts')

    // 創建音頻文件保存目錄

    // 讀取 CSV 檔案
    const csvData = fs.readFileSync(csvFilePath, 'utf-8')
    const lines = csvData
      .split('\n')
      .filter((line) => line.trim()) // 移除空行
      .slice(1)
    // 轉換成物件陣列，使用正則表達式來正確分割 CSV
    const musicList: MusicItem[] = lines.map((line) => {
      // 使用正則表達式來處理可能包含逗號的欄位
      const matches = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g) || []
      const values = matches.map((m) => m.replace(/^,/, '').replace(/^"|"$/g, '').trim())

      const [id, title, colors, ytUrl, wavUrl] = values

      return {
        id: parseInt(id),
        title: title.replace(/^["']|["']$/g, ''),
        colors: parseColors(colors),
        ytUrl: ytUrl.replace(/^["']|["']$/g, ''),
        wavUrl: wavUrl.replace(/^["']|["']$/g, '')
      }
    })
    // 生成 TypeScript 程式碼
    const tsContent = `// This file is auto-generated from CSV. Do not edit manually.
    export interface MusicItem {
      id: number
      title: string
      colors: string[]
      ytUrl: string
      wavUrl: string
    }

    export const musicList: MusicItem[] = ${JSON.stringify(musicList, null, 2)}

    export const getMusicById = (id: number): MusicItem | undefined => {
      return musicList.find(item => item.id === id)
    }

    export const getAllMusic = (): MusicItem[] => {
      return musicList
    }

    export const getMusicByColor = (color: string): MusicItem[] => {
      return musicList.filter(item => item.colors.includes(color))
    }

    export const getRandomMusic = (): MusicItem => {
      const randomIndex = Math.floor(Math.random() * musicList.length)
      return musicList[randomIndex]
    }
  `
    const outputDir = path.dirname(tsOutputPath)
    if (!fs.existsSync(outputDir)) {
      await fs.promises.mkdir(outputDir, { recursive: true })
    }

    // 寫入 TypeScript 檔案
    await fs.promises.writeFile(tsOutputPath, tsContent, 'utf-8')

    console.log('Successfully converted CSV to TypeScript file!')
  } catch (err) {
    console.error('Error in musicCsvToJson:', err)
  }
}

function parseColors(colorsStr: string): string[] {
  try {
    // 移除多餘的引號和空格
    const cleaned = colorsStr.replace(/^["']+|["']+$/g, '').trim()

    // 如果是陣列字符串格式，解析它
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
      // 移除 [] 並分割字符串
      const colorsArray = cleaned
        .slice(1, -1)
        .split(',')
        .map((color) => color.trim().replace(/^['"]|['"]$/g, ''))
        .filter((color) => color.startsWith('#')) // 確保只包含有效的顏色代碼

      return colorsArray
    }

    // 如果是單個顏色，返回單元素陣列
    if (cleaned.startsWith('#')) {
      return [cleaned]
    }

    return [] // 如果無法解析，返回空陣列
  } catch {
    return [] // 解析失敗時返回空陣列
  }
}

export async function downloadMusic(data: MusicItem[]): Promise<void> {
  const audioDir = path.join(app.getPath('desktop'), 'audio')
  console.log('audioDir:', audioDir)
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true })
  }

  for (const line of data) {
    console.log('line:', line)
    const cleanWavUrl = line.wavUrl.trim().replace(/^"|"$/g, '') // 移除引號
    const fileName = `song_${line.id}.wav`
    const outputPath = path.join(audioDir, fileName)
    // // 如果文件不存在才下載
    if (!fs.existsSync(outputPath)) {
      console.log(`Downloading: ${fileName}`)
      try {
        await downloadFile(cleanWavUrl, outputPath)
        console.log(`Successfully downloaded: ${fileName}`)
      } catch (err) {
        console.error(`Error downloading ${fileName}:`, err)
      }
    } else {
      console.log(`File already exists: ${fileName}`)
    }
  }
}
