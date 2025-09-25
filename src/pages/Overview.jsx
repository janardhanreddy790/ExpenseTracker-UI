import { useEffect, useState } from "react";
import { getSummaryByCategory, getSummaryByMonth } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, XAxis, YAxis, CartesianGrid, Bar, ResponsiveContainer } from "recharts";

const COLORS = ["#6366F1","#F59E0B","#10B981","#EF4444","#8B5CF6","#14B8A6"];

export default function Overview(){
  const [cat,setCat]=useState([]);const [mon,setMon]=useState([]);
  useEffect(()=>{
    getSummaryByCategory().then(d=>setCat(d.map(([n,v])=>({name:n,value:v}))));
    getSummaryByMonth().then(d=>setMon(d.map(([m,t])=>({month:m,total:t}))));
  },[]);
  return <div className="p-6 space-y-6">
    <h1 className="text-2xl">Analytics</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart><Pie data={cat} dataKey="value" nameKey="name" outerRadius={100}>
          {cat.map((e,i)=><Cell key={e.name} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/><Legend/></PieChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mon}><CartesianGrid/><XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/>
          <Bar dataKey="total" fill="#6366F1"/></BarChart>
      </ResponsiveContainer>
    </div>
  </div>;
}
