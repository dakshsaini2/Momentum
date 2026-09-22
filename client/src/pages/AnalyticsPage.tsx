import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Clock, Lightbulb } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { api } from "../api";
import type { AnalyticsSummary } from "../types";

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/analytics");
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-[#E6E8EC] rounded-[6px] w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-[#E6E8EC] rounded-[8px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#172033] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#176B5B]" /> Analytics
        </h1>
        <p className="text-xs text-[#667085]">Data insights on task completion velocity and focus time.</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-4 space-y-1">
          <p className="text-xs text-[#667085] font-medium">Total Tasks</p>
          <p className="text-2xl font-bold text-[#172033]">{data.summary.totalTasks}</p>
        </div>
        <div className="saas-card p-4 space-y-1">
          <p className="text-xs text-[#667085] font-medium">Completed</p>
          <p className="text-2xl font-bold text-[#2E7D5B]">{data.summary.completedTasks}</p>
        </div>
        <div className="saas-card p-4 space-y-1">
          <p className="text-xs text-[#667085] font-medium">Velocity Rate</p>
          <p className="text-2xl font-bold text-[#176B5B]">{data.summary.completionRate}%</p>
        </div>
        <div className="saas-card p-4 space-y-1">
          <p className="text-xs text-[#667085] font-medium">Focus Duration</p>
          <p className="text-2xl font-bold text-[#B7791F]">{data.summary.totalFocusMinutes} m</p>
        </div>
      </div>

      {/* Recharts Data Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Line Chart */}
        <div className="saas-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#172033] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#176B5B]" /> Weekly Task Velocity
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <XAxis dataKey="date" stroke="#98A2B3" fontSize={10} />
                <YAxis stroke="#98A2B3" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E6E8EC", color: "#172033", fontSize: "12px" }} />
                <Line type="monotone" dataKey="completed" stroke="#176B5B" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Time Bar Chart */}
        <div className="saas-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#172033] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#176B5B]" /> Focus Time (mins)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.focusWeeklyData}>
                <XAxis dataKey="day" stroke="#98A2B3" fontSize={10} />
                <YAxis stroke="#98A2B3" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E6E8EC", color: "#172033", fontSize: "12px" }} />
                <Bar dataKey="focusMinutes" fill="#176B5B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Engine */}
      <div className="saas-card p-5 space-y-3">
        <h3 className="text-xs font-semibold text-[#172033] flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#B7791F]" /> Productivity Insights
        </h3>
        <div className="space-y-2">
          {data.insights.map((insight, idx) => (
            <div key={idx} className="p-3 rounded-[6px] bg-[#F7F8FA] border border-[#E6E8EC] text-xs text-[#172033] flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B] shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
