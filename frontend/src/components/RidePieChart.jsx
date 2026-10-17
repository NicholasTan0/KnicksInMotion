import {
  PieChart,
  Pie,
  Sector,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#EB6800", "#0062CF"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (
    cx == null ||
    cy == null ||
    innerRadius == null ||
    outerRadius == null
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const MyCustomPie = (props) => (
  <Sector
    {...props}
    fill={COLORS[props.index % COLORS.length]}
    stroke="none"
  />
);

export default function RidePieChart({
  data,
  isAnimationActive = false,
}) {
  return (
    <PieChart
      style={{
        width: "100%",
        // maxWidth: "500px",
        // maxHeight: "80vh",
        aspectRatio: 1,
        // margin: "0 auto",
      }}
      responsive
    >
      <Pie
        data={data}
        dataKey="trips"
        nameKey="name"
        labelLine={false}
        label={renderCustomizedLabel}
        isAnimationActive={isAnimationActive}
        shape={MyCustomPie}
      />

      <Tooltip
        formatter={(value) => [`${value.toLocaleString()} trips`, "Trips"]}
      />

      <Legend
        content={() => (
          <ul className="flex justify-center gap-6 mt-2">
            {data.map((entry, index) => (
              <li
                key={entry.name}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: COLORS[index] }}
                />
                {entry.name}
              </li>
            ))}
          </ul>
        )}
      />
    </PieChart>
  );
}