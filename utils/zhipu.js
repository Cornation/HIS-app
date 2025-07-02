const API_KEY = '25ac7d6cfff342bba500aa1a59438a03.y8Ayrwe08Rz0n6QZ'  // ⚠️ 仅用于调试，请勿公开部署
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

/**
 * 调用智谱AI接口（包含知识库检索），返回清洗后的回答内容
 * @param {string} message 用户输入的问题
 * @returns {Promise<string>} AI返回文本（已去除<think>标签内容）
 */
export async function zhipuChat(message) {
  // 清除 <think>...</think> 标签及其内容
  function cleanThinkTags(text) {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  }

  try {
    const [err, response] = await uni.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      data: {
        model: 'glm-z1-flash',
        messages: [
          {
            role: 'system',
            content: '你是一个乐于解答各种问题的助手，你的任务是为用户提供专业、准确、有见地的建议。'
          },
          {
            role: 'user',
            content: message
          }
        ],
        stream: false,
        tools: [
          {
            type: 'retrieval',
            retrieval: {
              knowledge_id: '1939958544040419328'  // ✅ 替换为你的实际知识库 ID
            }
          }
        ],
        top_p: 0.95,
        temperature: 0.6,
        max_tokens: 2048
      }
    })

    if (err) {
      throw new Error(err.errMsg || '请求错误')
    }

    console.log('🔥 智谱原始响应:', response)

    const data = response.data
    if (!data || typeof data !== 'object') {
      throw new Error('响应格式异常')
    }

    if (data.choices && data.choices.length > 0) {
      const rawReply = data.choices[0].message.content
      return cleanThinkTags(rawReply)
    }

    if ('code' in data && data.code !== 200) {
      throw new Error('智谱返回错误：' + (data.message || JSON.stringify(data)))
    }

    throw new Error('AI未返回任何回答')
  } catch (error) {
    console.error('🚨 智谱AI请求失败:', error)
    throw error.message || '请求失败'
  }
}
