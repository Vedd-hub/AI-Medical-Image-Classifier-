import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { activity, modalityDistribution, resultDistribution } from '../data/dashboardStats'

const axis = { fontSize: 11, fill: '#8a93a0' }
const tip = { contentStyle: { borderRadius: 10, border: '1px solid #e3e7ed', fontSize: 12, boxShadow: 'none' } }

export function ActivityChart() {
  return (
    <div className="h-64 w-full" role="img" aria-label="Line chart of analyses over the last 7 days">
      <ResponsiveContainer>
        <LineChart data={activity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#eef0f4" vertical={false} />
          <XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} />
          <YAxis tick={axis} axisLine={false} tickLine={false} />
          <Tooltip {...tip} />
          <Line type="monotone" dataKey="analyses" stroke="#2a5a94" strokeWidth={2.2} dot={{ r: 3, fill: '#2a5a94' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ResultDonut() {
  const total = resultDistribution.reduce((s, d) => s + d.value, 0)
  return (
    <div>
      <div className="h-44 w-full" role="img" aria-label="Donut chart of result distribution">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={resultDistribution} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
              {resultDistribution.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip {...tip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1.5">
        {resultDistribution.map((d) => (
          <li key={d.name} className="flex items-center justify-between text-[12.5px]">
            <span className="flex items-center gap-2 text-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />{d.name}</span>
            <span className="font-medium tabular-nums text-ink">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ModalityChart() {
  return (
    <div className="h-56 w-full" role="img" aria-label="Bar chart of modality distribution">
      <ResponsiveContainer>
        <BarChart data={modalityDistribution} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ ...axis, fill: '#5f6874' }} axisLine={false} tickLine={false} width={80} />
          <Tooltip {...tip} cursor={{ fill: '#f3f5f8' }} />
          <Bar dataKey="value" fill="#4a83c2" radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
