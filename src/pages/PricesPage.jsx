import React, { useEffect, useState } from "react";
import api from "../services/api";

const PricesPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/prices/statistics").then((res) => setStats(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Statistik Harga</h1>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
};

export default PricesPage;
