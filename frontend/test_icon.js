const React = require('react');
const ReactDOMServer = require('react-dom/server');

const WeatherIcon = ({ symbolCode, windSpeed, windDir }) => {
  const code = parseInt(symbolCode, 10);
  if (isNaN(code)) return null;

  const renderWindArrows = () => {
    if (windSpeed === undefined || windSpeed === '-' || isNaN(windSpeed) || windSpeed <= 0) return null;
    const dir = parseInt(windDir, 10);
    const rotation = !isNaN(dir) ? dir - 90 : 0; 
    let numArrows = 1, color = "rgba(255, 255, 255, 0.4)", animSpeed = "2.5s";

    return React.createElement('g', { transform: `rotate(${rotation} 50 50)` },
      React.createElement('g', { stroke: color, strokeWidth: "2", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('animateTransform', { attributeName: "transform", type: "translate", from: "-40 0", to: "40 0", dur: animSpeed, repeatCount: "indefinite" }),
        React.createElement('animate', { attributeName: "opacity", values: "0;1;1;0", keyTimes: "0;0.2;0.8;1", dur: animSpeed, repeatCount: "indefinite" }),
        Array.from({ length: numArrows }).map((_, i) => {
          const yOffset = (i - (numArrows - 1) / 2) * 12;
          return React.createElement('g', { key: i, transform: `translate(0, ${yOffset})` },
            React.createElement('line', { x1: "30", y1: "50", x2: "70", y2: "50" }),
            React.createElement('polyline', { points: "60,45 70,50 60,55" })
          );
        })
      )
    );
  };

  return React.createElement('svg', null, renderWindArrows());
};

console.log(ReactDOMServer.renderToStaticMarkup(React.createElement(WeatherIcon, { symbolCode: 1, windSpeed: 2.1, windDir: 90 })));
