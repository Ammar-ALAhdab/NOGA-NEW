import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
  Text,
} from "recharts";

const BarChartComponent = ({ data, Yvalue , Xvalue,XdataKey, dataKey, fill, hoverFill , title  }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      <Text
        x={400}
        y={20}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={16}
      >
        {title}
      </Text>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <XAxis
            dataKey={XdataKey ? XdataKey :"branch_name"}
            label={{ value: Xvalue ? Xvalue : "الأفرع", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            label={{
              value: Yvalue,
              angle: -90,
              position: "insideLeft",
              offset: -17,
            }}
          />
          <Tooltip />
          <Bar
            dataKey={dataKey}
            fill={fill}
            activeBar={<Rectangle fill={hoverFill} stroke="blue" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

BarChartComponent.propTypes = {
  data: PropTypes.array,
  Yvalue: PropTypes.string,
  dataKey: PropTypes.string,
  fill: PropTypes.string,
  hoverFill: PropTypes.string,
  title: PropTypes.string,
};

export default BarChartComponent;
