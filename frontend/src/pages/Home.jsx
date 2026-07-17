import { memo } from "react";
import { Link } from "react-router-dom";
import { ChartColumn, Shield, Users, Crown } from 'lucide-react';
import CustomHome from "../components/CustomHome/CustomHome";

function Home() {
  return (
    <div className="container mx-auto p-2 sm:p-4 md:px-8 font-poppins">
      <CustomHome />
    </div>
  );
};

export default memo(Home);