import React, { useEffect, useState } from "react";
import api from "../services/api";

const RegionsPage = () => {
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    api.get("/regions/provinces").then((res) => setProvinces(res.data.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Daftar Provinsi</h1>
      <ul>
        {provinces.map((p) => (
          <li key={p.id}>{p.province_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RegionsPage;
