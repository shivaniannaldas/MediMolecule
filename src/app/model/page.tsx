// convert smile string in molecule using nvidia

"use client";
import Breadcrumb from "@/components/ComponentHeader/ComponentHeader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MoleculeStructure from "../../components/MoleculeStructure/index";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  createMoleculeGenerationHistory,
  getMoleculeGenerationHistoryByUser,
} from "@/lib/actions/molecule-generation.actions";
import { getUserByEmail } from "@/lib/actions/user.action";

const ModalLayout = () => {

  const { data: session } = useSession();
  const [smiles, setSmiles] = useState(
    "CCN(CC)C(=O)[C@@]1(C)Nc2c(ccc3ccccc23)C[C@H]1N(C)C",
  );

  const [numMolecules, setNumMolecules] = useState("10");
  const [minSimilarity, setMinSimilarity] = useState("0.3");
  const [particles, setParticles] = useState("30");
  const [iterations, setIterations] = useState("10");
  const [molecules, setMolecules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const user = await getUserByEmail(session.user.email);
          setUserId(user._id);
          const historyFromServer = await getMoleculeGenerationHistoryByUser(
            user._id,
          );
          setHistory(historyFromServer);
        } catch (error) {
          console.error("Error fetching user or history:", error);
        }
      }
    };

    fetchUserData();
  }, [session?.user?.email]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
  
    const payload = {
      algorithm: "CMA-ES",
      num_molecules: parseInt(numMolecules),
      property_name: "QED",
      minimize: false,
      min_similarity: parseFloat(minSimilarity),
      particles: parseInt(particles),
      iterations: parseInt(iterations),
      smi: smiles,
    };
  
    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data.molecules) {
        throw new Error("No molecules data in the response");
      }
  
      const generatedMolecules = JSON.parse(data.molecules).map((mol: any) => ({
        structure: mol.sample,
        score: mol.score,
      }));
  
      setMolecules(generatedMolecules);
  
      if (userId) {
        await createMoleculeGenerationHistory(
          {
            smiles,
            numMolecules: parseInt(numMolecules),
            minSimilarity: parseFloat(minSimilarity),
            particles: parseInt(particles),
            iterations: parseInt(iterations),
            generatedMolecules,
          },
          userId,
        );
  
        const updatedHistory = await getMoleculeGenerationHistoryByUser(userId);
        setHistory(updatedHistory);
      } else {
        console.error("User ID is not available.");
      }
  
      console.log(generatedMolecules);
    } catch (error:any) {
      console.error("Error fetching data:", error);
      // Handle the error appropriately, e.g., show an error message to the user
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <DefaultLayout>
      <Breadcrumb pageName="Generate Molecules" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-3">
        <div className="flex flex-col gap-9 sm:col-span-2">
          <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-[#121212] dark:bg-[#181818]">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                SMILES to Molecule Generator
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      SMILES String
                    </label>
                    <input
                      type="text"
                      value={smiles}
                      onChange={(e) => setSmiles(e.target.value)}
                      placeholder="Enter SMILES string"
                      className="w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-2 dark:bg-[#181818] dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Number of Molecules
                    </label>
                    <input
                      type="text"
                      value={numMolecules}
                      onChange={(e) => setNumMolecules(e.target.value)}
                      placeholder="Enter number of molecules"
                      className="w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-2 dark:bg-[#181818] dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Minimum Similarity
                  </label>
                  <input
                    type="text"
                    value={minSimilarity}
                    onChange={(e) => setMinSimilarity(e.target.value)}
                    placeholder="Enter minimum similarity"
                    className="w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-2 dark:bg-[#181818] dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Particles
                  </label>
                  <input
                    type="text"
                    value={particles}
                    onChange={(e) => setParticles(e.target.value)}
                    placeholder="Enter number of particles"
                    className="w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-2 dark:bg-[#181818] dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Iterations
                  </label>
                  <input
                    type="text"
                    value={iterations}
                    onChange={(e) => setIterations(e.target.value)}
                    placeholder="Enter number of iterations"
                    className="w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-2 dark:bg-[#181818] dark:text-white dark:focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Molecules"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-lg border border-stroke bg-white p-3 shadow-default dark:border-[#121212] dark:bg-[#181818]">
            <h3 className="font-medium text-black dark:text-white">
              Molecule Generation History
            </h3>
            <div className="mt-4 max-h-96 overflow-y-auto">
              {history.map((entry: any, index) => (
                <div key={index} className="border-b border-stroke py-3">
                  <p className="text-sm text-black dark:text-white">
                    <span className="font-bold">SMILES:</span> {entry.smiles}
                  </p>
                  <p className="text-sm text-black dark:text-white">
                    <span className="font-bold">Molecules:</span>{" "}
                    {entry.numMolecules}
                  </p>
                  <p className="text-sm text-black dark:text-white">
                    <span className="font-bold">Date:</span>{" "}
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3">
                    <button
                      className="text-primary hover:underline"
                      onClick={() => setMolecules(entry.generatedMolecules)}
                    >
                      View Molecules
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {molecules.length > 0 && (
        <div className="mt-8 rounded-lg bg-white p-2">
          <div className="mt-8 flex flex-col  gap-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {molecules.map((mol: any, index) => (
                <MoleculeStructure
                  key={index}
                  id={`mol-${index + 1}`}
                  structure={mol.structure}
                  scores={mol.score}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default ModalLayout;







/*"use client";

import Breadcrumb from "@/components/ComponentHeader/ComponentHeader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

const ModalLayout = () => {
  const [inputs, setInputs] = useState({
    smiles: "",
    moleculeNumber: "",
    minSimilarity: 0.3,
    particles: 30,
    iterations: 10,
  });
  const [molecule, setMolecule] = useState(null);
  const [isImageVisible, setIsImageVisible] = useState(false);  // To toggle image visibility

  const predefinedMolecules = [
    {
      smiles: "CCN(CC)C(=O)[C@@]1(C)Nc2c(ccc3ccccc23)C[C@H]1N(C)C",
      number: 1,
      image: "/images/user/mol-1.jpg",
    },
    {
      smiles: "C1=CC=C(C=C1)C=O",
      number: 2,
      image: "/images/user/mol-2.jpg",
    },
    {
      smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
      number: 3,
      image: "/images/user/mol-3.jpg",
    },
    {
      smiles: "C1=CC=CN=C1",
      number: 4,
      image: "/images/user/mol-4.jpg",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateMolecule = () => {
    const foundMolecule = predefinedMolecules.find(
      (mol) =>
        mol.smiles === inputs.smiles ||
        mol.number.toString() === inputs.moleculeNumber
    );
    setMolecule(foundMolecule || null);
  };

  const handleViewImage = () => {
    setIsImageVisible(!isImageVisible);  // Toggle the image visibility
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Generate Molecules" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-3">
        <div className="flex flex-col gap-9 sm:col-span-2">
          <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-[#121212] dark:bg-[#181818]">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Dynamic Molecule Generator
              </h3>
            </div>

            <div className="p-6.5">
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="smiles"
                  value={inputs.smiles}
                  onChange={handleInputChange}
                  placeholder="Enter SMILES String"
                  className="w-full rounded border border-stroke p-2"
                />
                <input
                  type="number"
                  name="moleculeNumber"
                  value={inputs.moleculeNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Molecule Number"
                  className="w-full rounded border border-stroke p-2"
                />
                <input
                  type="number"
                  name="minSimilarity"
                  value={inputs.minSimilarity}
                  onChange={handleInputChange}
                  placeholder="Enter Minimum Similarity"
                  className="w-full rounded border border-stroke p-2"
                />
                <input
                  type="number"
                  name="particles"
                  value={inputs.particles}
                  onChange={handleInputChange}
                  placeholder="Enter Particles"
                  className="w-full rounded border border-stroke p-2"
                />
                <input
                  type="number"
                  name="iterations"
                  value={inputs.iterations}
                  onChange={handleInputChange}
                  placeholder="Enter Iterations"
                  className="w-full rounded border border-stroke p-2"
                />
                <button
                  onClick={handleGenerateMolecule}
                  className="flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Generate Molecule
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-lg border border-stroke bg-white p-3 shadow-default dark:border-[#121212] dark:bg-[#181818]">
            <h3 className="font-medium text-black dark:text-white">
              Molecule Details
            </h3>
            {molecule ? (
              <div className="mt-4">
                <p className="mt-2 text-sm text-black dark:text-white">
                  <strong>SMILES:</strong> {molecule.smiles}
                </p>
                <p className="mt-2 text-sm text-black dark:text-white">
                  <strong>Particles:</strong> {inputs.particles}
                </p>
                <button
                  onClick={handleViewImage}
                  className="mt-2 text-blue-500 cursor-pointer"
                >
                  View Molecule
                </button>
                {isImageVisible && (
                  <div className="mt-4">
                    <img
                      src={molecule.image}
                      alt={molecule.number}
                      className="w-full h-auto"
                    />
                    
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-black dark:text-white">
                No molecule found. Please provide valid inputs.
              </p>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ModalLayout;*/