import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";
import { getPuzzleConfig } from "../data/puzzleConfigs.js";
import { useTimer } from "../providers/timerContext.jsx";

export default function Phase1() {
	const navigate = useNavigate();
	const { timeRemaining, getElapsedTime, isExpired } = useTimer();
	const [officer, setOfficer] = useState(null);
	const [currentSubphase, setCurrentSubphase] = useState(0);
	const [phase1Complete, setPhase1Complete] = useState(false);
	
	// QR Sub-phase 1 states
	const [qrCodes, setQrCodes] = useState([]);
	const [ddInput, setDdInput] = useState("");
	const [ddError, setDdError] = useState("");
	const [ddCorrect, setDdCorrect] = useState(false);
	
	// Puzzle Sub-phase 2 states
	const [puzzleConfig, setPuzzleConfig] = useState(null);
	const [puzzleFolder, setPuzzleFolder] = useState("puzzle1");
	const [gridState, setGridState] = useState({});
	const [selectedSlot, setSelectedSlot] = useState(null);
	const [placementOrder, setPlacementOrder] = useState([]);
	const [puzzleError, setPuzzleError] = useState("");
	const [puzzleSuccess, setPuzzleSuccess] = useState(false);
	const [showOriginalImage, setShowOriginalImage] = useState(false);
	
	// Route Sub-phase 3 states
	const [yearRevealed, setYearRevealed] = useState(false);
	const [shuffledRoutes, setShuffledRoutes] = useState([]);

	useEffect(() => {
		const load = async () => {
			const { data } = await api.get("/participants/phase1-story");
			setOfficer(data.officer);
			// Update backend progress: phase 1, subphase 1, lastVisitedRoute
			await api.post("/participants/progress/update", {
				currentPhase: 1,
				currentSubphase: 1,
				lastVisitedRoute: "/phase1"
			});
			// ...existing code...
			// Initialize QR codes (1 correct + 9 fake, shuffled)
			const codes = [
				{ src: "/qr/CorrectQr.png", isCorrect: true },
				...Array.from({ length: 9 }).map(() => ({ src: "/qr/DummyQr.png", isCorrect: false }))
			];
			setQrCodes(codes.sort(() => Math.random() - 0.5));
			// ...existing code...
			// Initialize puzzle config using officer's puzzle folder
			const puzzleFolder = data.officer?.puzzleFolder || "puzzle1";
			setPuzzleFolder(puzzleFolder);
			const config = getPuzzleConfig(puzzleFolder);
			setPuzzleConfig(config);
			// ...existing code...
			// Initialize grid state
			const initialState = {};
			config.layout.forEach((fileName, index) => {
				if (!fileName.startsWith("key_")) {
					initialState[index] = fileName;
				}
			});
			setGridState(initialState);
			// ...existing code...
			// Shuffle route options for randomized correct route position
			if (data.officer?.routeOptions) {
				const shuffled = [...data.officer.routeOptions].sort(() => Math.random() - 0.5);
				setShuffledRoutes(shuffled);
			}
		};
		load();
	}, []);

	// Puzzle handlers for Sub-phase 2
	const getAvailableKeyPieces = () => {
		if (!puzzleConfig) return [];
		const available = puzzleConfig.correctKeys.filter(key => !Object.values(gridState).includes(key));
		// Shuffle for randomization
		return available.sort(() => Math.random() - 0.5);
	};

	// Save progress helper
	const saveProgressToBackend = async (subphase) => {
		try {
			await api.post("/participants/save-progress", {
				subphase,
				timeRemaining: timeRemaining || 0,
				timeElapsed: getElapsedTime()
			});
		} catch (err) {
			console.error("Failed to save progress:", err);
		}
	};

	const handleDDValidation = () => {
		if (!officer) return;
		setDdError("");
		const correctDD = officer.dob.substring(0, 2);
		const inputDD = ddInput.trim();
		
		if (!inputDD) {
			setDdError("Please enter a DD value");
			return;
		}
		
		if (inputDD === correctDD) {
			setDdCorrect(true);
			saveProgressToBackend("phase1-subphase1-dd");
		} else {
			setDdError(`Incorrect DD. Try again. (Hint: Check the article carefully)`);
			setDdInput("");
		}
	};

	const handleSlotClick = (slotIndex) => {
		const fileName = puzzleConfig.layout[slotIndex];
		if (!fileName.startsWith("key_")) return; // Can't click fixed pieces
		setSelectedSlot(slotIndex);
	};

	const handleKeyPieceClick = (keyFileName) => {
		if (selectedSlot === null) {
			setPuzzleError("Please select an empty slot first");
			return;
		}
		setPuzzleError("");
		setGridState(prev => ({
			...prev,
			[selectedSlot]: keyFileName
		}));
		setPlacementOrder(prev => [...prev, { slot: selectedSlot, piece: keyFileName }]);
		setSelectedSlot(null);
	};

	const handleResetPuzzle = () => {
		const initialState = {};
		puzzleConfig.layout.forEach((fileName, index) => {
			if (!fileName.startsWith("key_")) {
				initialState[index] = fileName;
			}
		});
		setGridState(initialState);
		setPlacementOrder([]);
		setSelectedSlot(null);
		setPuzzleError("");
		setPuzzleSuccess(false);
		setShowOriginalImage(false);
	};

	const handleSubmitPuzzle = async () => {
		try {
			setPuzzleError("");
			const placedKeys = Object.values(gridState).filter(f => f.startsWith("key_"));
			const { data } = await api.post("/participants/verify-puzzle", {
				placedKeys,
				placementOrder,
				puzzleId: puzzleFolder
			});
			if (data.ok) {
				setPuzzleSuccess(true);
				saveProgressToBackend("phase1-subphase2-puzzle");
				// Show original image after 1 second delay
				setTimeout(() => {
					setShowOriginalImage(true);
				}, 1000);
			} else {
				setPuzzleError(data.error || "Incorrect placement");
			}
		} catch (err) {
				setPuzzleError(err.response?.data?.error || "Verification failed");
		}
	};

	const isSubphase2Complete = getAvailableKeyPieces().length === 0 && puzzleSuccess;
	const isSubphase3Complete = yearRevealed;

	const handleNext = () => {
		if (currentSubphase < 2) {
			setCurrentSubphase(currentSubphase + 1);
		} else if (currentSubphase === 2 && isSubphase3Complete) {
			setPhase1Complete(true);
		}
	};
	
	// Poll backend progress to check if year has been revealed (every 2 seconds)
	useEffect(() => {
		const pollProgress = async () => {
			try {
				const { data } = await api.get("/participants/progress");
				if (data.phase1YearRevealed && !yearRevealed) {
					setYearRevealed(true);
					saveProgressToBackend("phase1-subphase3-year");
				}
			} catch (err) {
				console.error("Failed to check progress", err);
			}
		};
		
		const interval = setInterval(pollProgress, 2000);
		return () => clearInterval(interval);
	}, [yearRevealed]);

	// Handle phase 1 completion - navigate to db-login
	useEffect(() => {
		if (phase1Complete) {
			// Save final progress before navigating
			const redirect = setTimeout(() => {
				navigate("/db-login");
			}, 1000);
			return () => clearTimeout(redirect);
		}
	}, [phase1Complete, navigate]);

	// Handle timeout - save progress
	useEffect(() => {
		if (isExpired) {
			// Game will auto-redirect via GameOverModal
			const saveTimeout = async () => {
				try {
					await api.post("/participants/end-game", { reason: "timeout" });
				} catch (err) {
					console.error("Failed to end game:", err);
				}
			};
			saveTimeout();
		}
	}, [isExpired]);

	return (
		<div className="min-h-screen relative">
			<div className="film-grain" />
			
			{/* Timer Display */}
			<div className="fixed top-6 right-6 z-50">
				<div className={`px-6 py-3 rounded-lg font-mono text-xl font-bold ${
					timeRemaining > 0 ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
				} border ${timeRemaining > 0 ? 'border-green-500/50' : 'border-red-500/50'}`}>
					{Math.floor(timeRemaining / 3600).toString().padStart(2, '0')}:{Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
				</div>
			</div>

			<div className="min-h-screen px-6 py-10">
				<div className="max-w-4xl mx-auto space-y-8">
					{phase1Complete ? (
						<div className="evidence-card p-8 text-center">
							<h2 className="text-3xl font-bold text-green-400 mb-4">Phase 1 Complete</h2>
							<p className="text-haze mb-2">You discovered the officer's date of birth.</p>
							<p className="text-haze">Return to the Database Login tab and enter DDMMYYYY.</p>
						</div>
					) : (
						<>
							<div className="evidence-card p-6">
								<h2 className="text-2xl font-semibold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
									Officer Info Access
								</h2>
								<p className="text-haze mt-2">Complete all three sub-phases, then return to the DB login tab.</p>
							</div>

							<div className="flex gap-2 justify-center">
								{[0, 1, 2].map((num) => (
									<div
										key={num}
										className={`w-3 h-3 rounded-full ${currentSubphase >= num ? "bg-amber-500" : "bg-white/20"}`}
									/>
								))}
							</div>

							{currentSubphase === 0 && (
								<div className="evidence-card p-8">
									<h2 className="text-2xl font-semibold mb-2">Sub-phase 1: Reveal the Day (DD)</h2>
									<p className="text-haze mb-6">Scan the QR codes with your phone to find the news article that reveals the day.</p>

									{/* Fallback for missing officer or QR codes */}
									{!officer && (
										<div className="text-red-400 font-bold mb-4">Officer info not loaded. Please refresh or check backend.</div>
									)}
									{qrCodes.length === 0 && (
										<div className="text-red-400 font-bold mb-4">QR codes not loaded. Please check /public/qr/CorrectQr.png and DummyQr.png.</div>
									)}

									<div className="grid grid-cols-5 gap-4 mb-8">
										{qrCodes.map((qr, idx) => (
											<div
												key={idx}
												className="aspect-square bg-white p-2 rounded flex items-center justify-center"
											>
												<img src={qr.src} alt={`QR ${idx + 1}`} className="w-full h-full object-contain" />
											</div>
										))}
									</div>

									{/* DD Input Section */}
									<div className="bg-ink/50 border border-white/20 p-6 rounded mb-6">
										<p className="text-white font-semibold mb-4">📅 Enter the DD (Day) you found:</p>
										<div className="flex gap-3">
											<input
												type="text"
												maxLength="2"
												placeholder="e.g., 15"
												value={ddInput}
												onChange={(e) => setDdInput(e.target.value.replace(/\D/g, ""))}
												onKeyPress={(e) => e.key === "Enter" && handleDDValidation()}
												className="px-4 py-2 bg-black border border-white/30 rounded text-white text-center text-2xl font-bold tracking-widest w-24"
												disabled={ddCorrect}
											/>
											<button
												onClick={handleDDValidation}
										disabled={ddCorrect}
										className="px-6 py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
									>
										Validate
									</button>
								</div>
								
								{ddError && (
									<p className="text-ember text-sm mt-3">❌ {ddError}</p>
								)}
								
								{ddCorrect && (
									<p className="text-green-400 text-sm mt-3">✓ Correct! You found the Day.</p>
								)}
							</div>

							<div className="bg-ink/50 border border-white/20 p-4 rounded mb-6">
								<p className="text-haze text-sm">💡 Tip: Scan each QR code with your phone camera to find the article that contains the day (DD) of birth.</p>
							</div>

							<div className="flex justify-end">
								<button
									onClick={handleNext}
									disabled={!ddCorrect}
									className="btn-investigate px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									Next
								</button>
							</div>
						</div>
					)}

					{currentSubphase === 1 && puzzleConfig && (
						<div className="evidence-card p-8">
							<h2 className="text-2xl font-semibold mb-2">Sub-phase 2: Assemble Evidence (MM)</h2>
								<p className="text-haze mb-6">Click on empty slots to select them, then click on puzzle pieces to place them in the grid.</p>

								<div className="grid grid-cols-2 gap-8">
									{/* Puzzle Grid */}
									<div>
										<h3 className="text-lg font-semibold mb-4 text-white">Puzzle Grid</h3>
								
								{/* Show Original Image if revealed, otherwise show puzzle grid */}
								{showOriginalImage ? (
									<div className="relative overflow-hidden rounded-lg border-4 border-emerald-500 shadow-2xl bg-black">
										<div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-emerald-400/20 animate-pulse"></div>
										<img
											src={`/puzzle/${puzzleFolder}/original.png`}
											alt="Complete Evidence"
											className="w-full h-auto relative z-10 transform transition-all duration-1000 ease-out"
											style={{ animation: "slideInScale 1s ease-out" }}
											onError={(e) => { e.target.style.display = "none"; }}
										/>
										<div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-20 animate-bounce">
											✓ EVIDENCE REVEALED
										</div>
									</div>
								) : (
									<div className="grid grid-cols-3 gap-0 bg-ink p-6 rounded border border-white/20">
										{puzzleConfig.layout.map((fileName, idx) => {
											const isKeySlot = fileName.startsWith("key_");
											const hasPlacedKey = gridState[idx];
											
											return (
												<button
													key={idx}
													onClick={() => isKeySlot && handleSlotClick(idx)}
													className={`aspect-square rounded border-2 flex items-center justify-center text-center text-xs font-mono overflow-hidden ${ 
														isKeySlot
															? selectedSlot === idx
																? "border-ember bg-ember/30 cursor-pointer"
																: hasPlacedKey
																? "border-green-500/50 bg-green-900/20 cursor-default"
																: "border-dashed border-white/20 bg-ink/50 cursor-pointer hover:border-white/40"
															: "border-white/20 bg-ink/80 cursor-default"
													}`}
												>
													{hasPlacedKey ? (
														// User placed a key here
														<img
															src={`/puzzle/${puzzleFolder}/${hasPlacedKey}.png`}
															alt={hasPlacedKey}
															className="w-full h-full object-contain"
															onError={(e) => { e.target.style.display = "none"; }}
														/>
													) : !isKeySlot ? (
														// Fixed puzzle piece (not a key slot)
														<img
															src={`/puzzle/${puzzleFolder}/${fileName}.png`}
															alt={fileName}
															className="w-full h-full object-contain"
															onError={(e) => { e.target.style.display = "none"; }}
														/>
													) : (
														// Empty key slot (no piece placed yet)
														<span className="text-haze text-lg font-bold">?</span>
													)}
												</button>
											);
										})}
									</div>
								)}
								
								{puzzleSuccess && !showOriginalImage && (
									<div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 rounded animate-pulse">
										<p className="text-green-300 text-sm font-semibold">✓ Puzzle solved! Revealing evidence...</p>
									</div>
								)}
							</div>

							{/* Available Pieces */}
							<div>
								<h3 className="text-lg font-semibold mb-4 text-white">Available Pieces</h3>
										<div className="grid grid-cols-2 gap-3 mb-6">
											{getAvailableKeyPieces().map((keyFileName) => (
												<button
													key={keyFileName}
													onClick={() => handleKeyPieceClick(keyFileName)}
													className="aspect-square rounded border-2 border-ember/50 bg-ember/10 hover:bg-ember/20 hover:border-ember transition flex items-center justify-center"
												>
													<img
														src={`/puzzle/${puzzleFolder}/${keyFileName}.png`}
														alt={keyFileName}
														className="w-full h-full object-contain rounded"
														onError={(e) => { e.target.style.display = "none"; }}
													/>
												</button>
											))}
										</div>

										{puzzleError && (
											<div className="p-3 bg-ember/20 border border-ember/50 rounded mb-4">
												<p className="text-ember text-sm">⚠️ {puzzleError}</p>
											</div>
										)}

										<div className="space-y-3">
											<button
												onClick={handleSubmitPuzzle}
												disabled={getAvailableKeyPieces().length > 0}
												className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
											>
												Verify Puzzle
											</button>
											<button
												onClick={handleResetPuzzle}
												className="w-full py-2 px-4 bg-ink border border-white/20 text-haze font-semibold rounded hover:border-white/40 transition"
											>
												Reset
											</button>
										</div>
									</div>
								</div>

								<div className="flex justify-end mt-8">
									<button
										onClick={handleNext}
										disabled={!isSubphase2Complete}
										className="btn-investigate px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
									>
										Next
									</button>
								</div>
							</div>
						)}

						{currentSubphase === 2 && officer && (
							<div className="evidence-card p-8">
								<h2 className="text-2xl font-semibold mb-2">Sub-phase 3: Reveal the Year (YYYY)</h2>
								<p className="text-haze mb-8">Investigate the routes below to find the correct one. Unscramble the word and answer correctly to reveal the year.</p>

								{/* DEBUG - Show if routeOptions exist */}
				{(!shuffledRoutes || shuffledRoutes.length === 0) && (
					<div className="bg-red-900/30 border border-red-500/50 p-4 rounded mb-4">
						<p className="text-red-400 text-sm">⚠️ Debug: routeOptions not found. Data: {JSON.stringify(shuffledRoutes)}</p>
					</div>
				)}

				{/* Jumbled Word Display */}
				<div className="text-center mb-10">
					<p className="text-haze text-sm mb-3">🔤 SQL-Related Jumbled Word:</p>
					<div className="inline-block bg-ink border-2 border-ember/50 rounded px-8 py-6">
						<p className="text-3xl font-mono text-ember tracking-widest font-bold">
							{(officer?.jumbled || officer?.jumbledWord) && (officer.jumbled || officer.jumbledWord).split("").sort().join(" ")}
						</p>
					</div>
					<p className="text-haze text-xs mt-4">Remember this word before exploring the routes</p>
				</div>

				{/* Route Buttons */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					{shuffledRoutes.map((route, idx) => {
										const routeNum = idx + 1;
										const jumbledWord = officer?.jumbled || officer?.jumbledWord || "INVESTIGATION";
										const routeUrl = `/route-challenge?routeId=${routeNum}&jumbled=${jumbledWord}&answer=${officer?.answer || ""}&year=${officer?.dob?.substring(4) || ""}&isCorrect=${route.isCorrect}`;
										
										return (
											<a
												key={idx}
												href={routeUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="p-6 rounded border-2 bg-ink hover:bg-ink/80 border-white/20 hover:border-ember/50 transition text-center cursor-pointer"
											>
												<p className="text-lg font-bold text-white mb-2">Route {routeNum}</p>
												<p className="text-haze text-sm">{route.label || `Path ${routeNum}`}</p>
												<p className="text-xs text-haze/60 mt-2">→ Click to explore</p>
											</a>
										);
									})}
								</div>

								{/* Hint */}
								<div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded mb-8">
									<p className="text-amber-300 text-sm">
										💡 <strong>Hint:</strong> Open each route in a new tab. One route will give you the key to reveal the year. 
										Remember to unscramble the word and provide the correct answer.
									</p>
								</div>

								{/* Completion status */}
								{yearRevealed && (
									<div className="bg-green-900/30 border border-green-500/50 p-4 rounded mb-8">
										<p className="text-green-300 font-semibold">✓ Year revealed!</p>
										<p className="text-haze text-sm mt-2">You have collected all three parts: DD-MM-YYYY</p>
									</div>
								)}

								<div className="flex justify-end">
									<button
										onClick={handleNext}
										disabled={!yearRevealed}
										className="btn-investigate px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
									>
										Complete Phase 1
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
		</div>
	);
}
