import React, { useEffect, useState } from "react";
import api from "../services/api";

const OverridesPage = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/overrides").then((res) => setData(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Overrides</h1>
      <ul>
        {data.map((o) => (
          <li key={o.id}>{o.commodity_id} - {o.price} ({o.status})</li>
        ))}
      </ul>
    </div>
  );
};

export default OverridesPage;
