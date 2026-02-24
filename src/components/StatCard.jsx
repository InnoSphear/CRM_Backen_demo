import React from "react";

const StatCard = ({ label, value, accent }) => {
  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
