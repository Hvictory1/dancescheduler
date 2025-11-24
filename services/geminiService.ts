import { GoogleGenAI } from "@google/genai";
import { ClassSession, Studio, WeeklyStats } from "../types";
import { DAYS_OF_WEEK } from "../constants";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeeklyAnalysis = async (
  classes: ClassSession[],
  studios: Studio[],
  stats: WeeklyStats
) => {
  try {
    const ai = getClient();
    
    // Prepare data for prompt
    const scheduleSummary = classes.map(c => {
      const studio = studios.find(s => s.id === c.studioId);
      return `${DAYS_OF_WEEK[c.dayIndex]}: ${c.startTime}-${c.endTime} @ ${studio?.name || 'Unknown'} (${studio?.rate}/hr)`;
    }).join('\n');

    const prompt = `
      我是一名兼职舞蹈老师。这是我的一周课表和收入情况:
      
      总收入: ${stats.totalIncome} 元
      总工时: ${stats.totalHours} 小时
      总课时数: ${stats.classCount} 节
      
      详细课表:
      ${scheduleSummary}
      
      请简短地（200字以内）分析我的工作强度和收入情况。
      给出1-2个关于时间管理或增加收入的专业建议。
      请用亲切、鼓励的语气。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("无法生成分析，请检查网络或API Key。");
  }
};