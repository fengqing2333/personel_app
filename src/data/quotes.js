/**
 * 每日格言
 * 中英文励志名言，用于主页每日显示
 */
export const quotes = [
  {
    text: '千里之行，始于足下。',
    author: '老子'
  },
  {
    text: 'A journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu'
  },
  {
    text: '不积跬步，无以至千里；不积小流，无以成江海。',
    author: '荀子'
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain'
  },
  {
    text: '学而时习之，不亦说乎。',
    author: '孔子'
  },
  {
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius'
  },
  {
    text: '知者不惑，仁者不忧，勇者不惧。',
    author: '《论语》'
  },
  {
    text: 'Believe you can and you\'re halfway there.',
    author: 'Theodore Roosevelt'
  },
  {
    text: '天行健，君子以自强不息。',
    author: '《周易》'
  },
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs'
  },
  {
    text: '博观而约取，厚积而薄发。',
    author: '苏轼'
  },
  {
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill'
  }
]

/**
 * 根据日期获取每日名言（基于日期哈希选择）
 * @param {Date} date
 * @returns {{ text: string, author: string }}
 */
export function getDailyQuote(date = new Date()) {
  const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  let hash = 0
  for (let i = 0; i < dayKey.length; i++) {
    hash = ((hash << 5) - hash) + dayKey.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % quotes.length
  return quotes[index]
}
