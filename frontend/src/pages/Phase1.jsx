import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";
import { getPuzzleConfig } from "../data/puzzleConfigs.js";
import { useTimer } from "../providers/timerContext.jsx";
import TimerDisplay from "../components/TimerDisplay.jsx";

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
		<div className="min-h-screen relative overflow-hidden bg-background">
			<div className="absolute inset-0 z-0 opacity-10 fingerprint-bg" />
			<div className="absolute inset-0 z-0 grid-overlay opacity-20"></div>
			
			<div className="min-h-screen px-6 py-10 relative z-10">
				<div className="max-w-4xl mx-auto space-y-8">
					{phase1Complete ? (
						<div className="bg-card border border-primary/50 p-8 text-center rounded-xl shadow-[0_0_50px_rgba(0,245,255,0.2)] animate-fadeIn">
							<h2 className="text-3xl font-bold text-secondary mb-4 tracking-wider">PHASE 1 COMPLETE</h2>
							<div className="h-1 w-20 bg-secondary mx-auto mb-6 rounded-full"></div>
							<p className="text-muted-foreground mb-2 font-mono">OFFICER DATE OF BIRTH ACQUIRED.</p>
							<p className="text-primary font-bold animate-pulse">RETURN TO DATABASE LOGIN AND ENTER DDMMYYYY.</p>
						</div>
					) : (
						<>
							<div className="bg-card border border-border p-6 rounded-xl shadow-lg relative overflow-hidden">
								<div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
								<h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
									<span className="text-primary">OFFICER</span> INFO ACCESS
								</h2>
								<p className="text-muted-foreground mt-2 font-mono text-sm">COMPLETE ALL SUB-PROTOCOLS TO PROCEED.</p>
							</div>

							<div className="flex gap-4 justify-center items-center">
								{[0, 1, 2].map((num) => (
									<div
										key={num}
										className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 font-bold ${
											currentSubphase >= num 
												? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,59,59,0.5)]" 
												: "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
										}`}
									>
										{num + 1}
									</div>
								))}
							</div>

							{currentSubphase === 0 && (
								<div className="bg-card border border-border p-8 rounded-xl shadow-md animate-fadeIn">
									<h2 className="text-2xl font-bold mb-2 text-primary">PROTOCOL 1: REVEAL DAY (DD)</h2>
									<p className="text-muted-foreground mb-6 font-mono text-sm border-l-2 border-secondary/50 pl-4">
										SCAN QR CODES TO LOCATE THE ARCHIVED ARTICLE. IDENTIFY THE DAY OF BIRTH.
									</p>

									{/* Fallback for missing officer or QR codes */}
									{!officer && (
										<div className="p-4 bg-destructive/10 border border-destructive text-destructive font-bold mb-4 rounded">
											⚠ CRITICAL: OFFICER DATA CORRUPTED. REFRESH SYSTEM.
										</div>
									)}
									{qrCodes.length === 0 && (
										<div className="p-4 bg-destructive/10 border border-destructive text-destructive font-bold mb-4 rounded">
											⚠ CRITICAL: QR DATA MISSING. CHECK ASSETS.
										</div>
									)}

									<div className="grid grid-cols-5 gap-4 mb-8">
										{qrCodes.map((qr, idx) => (
											<div
												key={idx}
												className="aspect-square bg-white p-2 rounded flex items-center justify-center hover:scale-105 transition-transform duration-300 shadow-lg"
											>
												<img src={qr.src} alt={`QR ${idx + 1}`} className="w-full h-full object-contain" />
											</div>
										))}
									</div>

									{/* DD Input Section */}
									<div className="bg-muted/30 border border-white/10 p-6 rounded-lg mb-6 backdrop-blur-sm">
										<p className="text-foreground font-bold mb-4 flex items-center gap-2">
											<span className="text-secondary">📅</span> INPUT RETRIEVED DATA (DD):
										</p>
										<div className="flex gap-3">
											<input
												type="text"
												maxLength="2"
												placeholder="DD"
												value={ddInput}
												onChange={(e) => setDdInput(e.target.value.replace(/\D/g, ""))}
												onKeyPress={(e) => e.key === "Enter" && handleDDValidation()}
												className="px-4 py-3 bg-background border border-border rounded text-primary text-center text-2xl font-bold tracking-widest w-24 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
												disabled={ddCorrect}
											/>
											<button
												onClick={handleDDValidation}
												disabled={ddCorrect}
												className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition uppercase tracking-wider"
											>
												VALIDATE
											</button>
										</div>
								
										{ddError && (
											<p className="text-destructive text-sm mt-3 font-mono">❌ {ddError}</p>
										)}
										
										{ddCorrect && (
											<div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
												<p className="text-green-400 text-sm font-bold">✓ DATA VERIFIED. PROCEED.</p>
											</div>
										)}
									</div>

									<div className="bg-secondary/5 border border-secondary/20 p-4 rounded mb-6">
										<p className="text-secondary text-xs font-mono">
											<span className="font-bold">TIP:</span> SCAN QR CODES WITH EXTERNAL DEVICE. LOCATE "DD" IN ARTICLE CONTENT.
										</p>
									</div>

									<div className="flex justify-end">
										<button
											onClick={handleNext}
											disabled={!ddCorrect}
											className="px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest transition-all shadow-lg shadow-secondary/20"
										>
											NEXT PROTOCOL
										</button>
									</div>
								</div>
							)}

							{currentSubphase === 1 && puzzleConfig && (
								<div className="bg-card border border-border p-8 rounded-xl shadow-md animate-fadeIn">
									<h2 className="text-2xl font-bold mb-2 text-primary">PROTOCOL 2: EVIDENCE ASSEMBLY (MM)</h2>
									<p className="text-muted-foreground mb-6 font-mono text-sm border-l-2 border-secondary/50 pl-4">
										RECONSTRUCT THE EVIDENCE. SELECT SLOT, THEN SELECT FRAGMENT.
									</p>

									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
										{/* Puzzle Grid */}
										<div>
											<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Reconstruction Grid</h3>
									
											{/* Show Original Image if revealed, otherwise show puzzle grid */}
											{showOriginalImage ? (
												<div className="relative overflow-hidden rounded-lg border-2 border-secondary shadow-[0_0_30px_rgba(0,245,255,0.3)] bg-black animate-in fade-in zoom-in duration-500">
													<div className="absolute inset-0 scanline opacity-50"></div>
													<img
														src={`/puzzle/${puzzleFolder}/original.png`}
														alt="Complete Evidence"
														className="w-full h-auto relative z-10"
														onError={(e) => { e.target.style.display = "none"; }}
													/>
													<div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-4 py-1 rounded text-xs font-bold shadow-lg z-20 animate-pulse">
														EVIDENCE RESTORED
													</div>
												</div>
											) : (
												<div className="grid grid-cols-3 gap-1 bg-muted/50 p-2 rounded border border-border">
													{puzzleConfig.layout.map((fileName, idx) => {
														const isKeySlot = fileName.startsWith("key_");
														const hasPlacedKey = gridState[idx];
														
														return (
															<button
																key={idx}
																onClick={() => isKeySlot && handleSlotClick(idx)}
																className={`aspect-square rounded flex items-center justify-center text-center text-xs font-mono overflow-hidden transition-all ${ 
																	isKeySlot
																		? selectedSlot === idx
																			? "border-2 border-primary bg-primary/20 cursor-pointer shadow-[inset_0_0_10px_rgba(255,59,59,0.5)]"
																			: hasPlacedKey
																			? "border border-green-500/50 bg-green-500/10 cursor-default"
																			: "border border-dashed border-muted-foreground/50 bg-background/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5"
																		: "border border-transparent bg-transparent cursor-default opacity-80"
																}`}
															>
																{hasPlacedKey ? (
																	<img
																		src={`/puzzle/${puzzleFolder}/${hasPlacedKey}.png`}
																		alt={hasPlacedKey}
																		className="w-full h-full object-contain"
																		onError={(e) => { e.target.style.display = "none"; }}
																	/>
																) : !isKeySlot ? (
																	<img
																		src={`/puzzle/${puzzleFolder}/${fileName}.png`}
																		alt={fileName}
																		className="w-full h-full object-contain"
																		onError={(e) => { e.target.style.display = "none"; }}
																	/>
																) : (
																	<span className="text-muted-foreground/50 text-2xl font-bold">+</span>
																)}
															</button>
														);
													})}
												</div>
											)}
											
											{puzzleSuccess && !showOriginalImage && (
												<div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded animate-pulse">
													<p className="text-green-400 text-xs font-bold font-mono">✓ MATCH CONFIRMED. DECRYPTING VISUAL...</p>
												</div>
											)}
										</div>

										{/* Available Pieces */}
										<div>
											<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Fragment Bank</h3>
											<div className="grid grid-cols-3 gap-3 mb-6 bg-muted/30 p-4 rounded-lg border border-border">
												{getAvailableKeyPieces().map((keyFileName) => (
													<button
														key={keyFileName}
														onClick={() => handleKeyPieceClick(keyFileName)}
														className="aspect-square rounded border border-border bg-background hover:border-primary hover:shadow-[0_0_10px_rgba(255,59,59,0.3)] transition-all flex items-center justify-center p-1"
													>
														<img
															src={`/puzzle/${puzzleFolder}/${keyFileName}.png`}
															alt={keyFileName}
															className="w-full h-full object-contain"
															onError={(e) => { e.target.style.display = "none"; }}
														/>
													</button>
												))}
												{getAvailableKeyPieces().length === 0 && !puzzleSuccess && (
													<div className="col-span-3 text-center py-4 text-muted-foreground text-xs font-mono">
														NO FRAGMENTS REMAINING
													</div>
												)}
											</div>

											{puzzleError && (
												<div className="p-3 bg-destructive/10 border border-destructive/50 rounded mb-4">
													<p className="text-destructive text-xs font-bold">⚠ {puzzleError}</p>
												</div>
											)}

											<div className="space-y-3">
												<button
													onClick={handleSubmitPuzzle}
													disabled={getAvailableKeyPieces().length > 0}
													className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition uppercase tracking-wider text-sm shadow-md"
												>
													VERIFY CONFIGURATION
												</button>
												<button
													onClick={handleResetPuzzle}
													className="w-full py-2 px-4 bg-transparent border border-muted-foreground/30 text-muted-foreground font-bold rounded hover:border-foreground hover:text-foreground transition text-xs uppercase"
												>
													RESET GRID
												</button>
											</div>
										</div>
									</div>

									<div className="flex justify-end mt-8">
										<button
											onClick={handleNext}
											disabled={!isSubphase2Complete}
											className="px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest transition-all shadow-lg shadow-secondary/20"
										>
											NEXT PROTOCOL
										</button>
									</div>
								</div>
							)}

							{currentSubphase === 2 && officer && (
								<div className="bg-card border border-border p-8 rounded-xl shadow-md animate-fadeIn">
									<h2 className="text-2xl font-bold mb-2 text-primary">PROTOCOL 3: TEMPORAL LOCK (YYYY)</h2>
									<p className="text-muted-foreground mb-8 font-mono text-sm border-l-2 border-secondary/50 pl-4">
										ANALYZE NAVIGATION ROUTES. UNSCRAMBLE THE KEYWORD. REVEAL THE YEAR.
									</p>

									{/* DEBUG - Show if routeOptions exist */}
									{(!shuffledRoutes || shuffledRoutes.length === 0) && (
										<div className="bg-destructive/10 border border-destructive/50 p-4 rounded mb-4">
											<p className="text-destructive text-sm font-mono">⚠ SYSTEM ERROR: ROUTE DATA UNREACHABLE.</p>
										</div>
									)}

									{/* Jumbled Word Display */}
									<div className="text-center mb-10">
										<p className="text-secondary text-xs uppercase tracking-widest mb-3 font-bold">Encrypted Keyword</p>
										<div className="inline-block bg-muted/50 border-2 border-primary/50 rounded-lg px-12 py-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
											<div className="absolute inset-0 scanline opacity-30"></div>
											<p className="text-4xl font-mono text-primary tracking-[0.5em] font-bold animate-pulse">
												{(officer?.jumbled || officer?.jumbledWord) && (officer.jumbled || officer.jumbledWord).split("").sort().join(" ")}
											</p>
										</div>
										<p className="text-muted-foreground text-xs mt-4 font-mono">DECRYPT BEFORE PROCEEDING</p>
									</div>

									{/* Route Buttons */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
													className="p-6 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-secondary transition-all group text-center cursor-pointer shadow-sm relative overflow-hidden"
												>
													<div className="absolute inset-0 bg-secondary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
													<p className="text-xl font-bold text-foreground mb-2 relative z-10 group-hover:text-secondary">ROUTE {routeNum}</p>
													<p className="text-muted-foreground text-sm font-mono relative z-10">{route.label || `Path ${routeNum}`}</p>
													<p className="text-xs text-secondary mt-4 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">INITIATE TRAVERSAL →</p>
												</a>
											);
										})}
									</div>

									{/* Hint */}
									<div className="bg-secondary/10 border border-secondary/30 p-4 rounded mb-8">
										<p className="text-secondary text-xs font-mono">
											<span className="font-bold">INSTRUCTION:</span> OPEN EACH ROUTE. IDENTIFY THE CORRECT PATH TO ACQUIRE THE "YYYY" COMPONENT.
										</p>
									</div>

									{/* Completion status */}
									{yearRevealed && (
										<div className="bg-green-500/10 border border-green-500/50 p-6 rounded mb-8 flex items-center gap-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
											<div className="p-3 bg-green-500/20 rounded-full text-green-500 text-2xl">✓</div>
											<div>
												<p className="text-green-500 font-bold tracking-wide">YEAR COMPONENT RETRIEVED</p>
												<p className="text-muted-foreground text-sm mt-1 font-mono">FULL DATE OF BIRTH COMPILED: DD-MM-YYYY</p>
											</div>
										</div>
									)}

									<div className="flex justify-end">
										<button
											onClick={handleNext}
											disabled={!yearRevealed}
											className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
										>
											FINALIZE PHASE 1
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
