# Phase 1 Quick Start Guide

## What Was Built

Your Phase 1 now has:
✅ Officer profile display with story
✅ Password-protected database login (uses DDMMYYYY format)
✅ 3 sequential sub-phases that unlock DD, MM, YYYY separately
✅ QR scanning → News article (reveals DD)
✅ Drag & drop object assembly (reveals MM)  
✅ Jumbled word + route selection (reveals YYYY)
✅ 10 pre-configured officers with unique data

## How Players Experience It

```
Login → Assigned Officer → Phase 1 Entry
↓
See Officer Story + Login Screen
↓
Enter Password (Birthday DDMMYYYY) → "Access Officer Info"
↓
SUB-PHASE 1: Scan 10 QRs, find correct one
  → Opens news article mentioning "On [DD]th of month..."
  → Learn officer's birth day
  → Click "Next"
↓
SUB-PHASE 2: Drag & drop puzzle pieces to assemble evidence
  → See progress (2 of 4 placed)
  → Learn officer's birth month
  → Click "Next"
↓
SUB-PHASE 3: Decode jumbled word, choose correct path
  → Select from 3 routes
  → Correct one shows: "🔑 Year Revealed: YYYY"
  → Wrong ones show fool messages
  → Click "Complete Phase 1"
↓
See: "Phase 1 Complete! Birthday: DD/MM/YYYY"
↓
Proceed to Phase 2 Database Login
```

## What You Need to Customize

### 1. **10 Real QR Codes**
Currently using placeholder links like "qr-neel-1". You need to:
- Generate 10 real QR codes
- Update the `qrLinks` array in officers.json
- Each officer gets 2 QR codes (one real, one decoy OR additional decoys)

**Location**: `backend/sample-data/officers.json` → `qrLinks` field

### 2. **Officer Customization** (per officer)
Update in `backend/sample-data/officers.json`:
- `name`: Full officer name
- `dob`: Date of birth in DDMMYYYY format (e.g., "15061988")
- `background`: Officer's background story (2-3 sentences)
- `story`: Personal officer story/character
- `lastCase`: Name of their last case
- `articleText`: Full news article that mentions their birth date (e.g., "On 25th March, Officer was recognized at...")
- `jumbledWord`: Jumbled word unique to officer
- `routeOptions`: Update path names and content

### 3. **Optional Enhancements**
- Add `imageUrl` - Link to officer photo
- Add `puzzleImageUrl` - Image of the broken object
- Customize `destructedObject` - Name of object being assembled

## How to Update Officers

Edit `backend/sample-data/officers.json`:

```json
{
  "name": "Officer Your Name",
  "dob": "25031988",
  "background": "Your officer's background here",
  "story": "Personal story",
  "lastCase": "Case name",
  "articleText": "News article mentioning 25th of month...",
  "qrLinks": ["your-real-qr-link", "fake-qr-link"],
  "jumbledWord": "UNIQUEWORD",
  "routeOptions": [
    { "label": "Path 1", "content": "Failure message", "isCorrect": false },
    { "label": "Path 2", "content": "🔑 Year of Birth Revealed: 1988", "isCorrect": true },
    { "label": "Path 3", "content": "Failure message", "isCorrect": false }
  ]
}
```

## Database Setup

You need to insert the officers.json data into MongoDB:

**Option 1**: Using MongoDB Compass/CLI
```
db.officers.insertMany([... data from officers.json ...])
```

**Option 2**: REST API (if you have an import endpoint)

**Option 3**: Admin panel (if you built one)

## Testing Checklist Before Event

- [ ] Test with officer #1: Full flow from login to Phase 2
- [ ] Test with officer #10: Full flow
- [ ] Verify passwords work (DDMMYYYY format)
- [ ] Valid QR navigates to article ✓
- [ ] Invalid QR shows error ✓  
- [ ] Puzzle pieces snap correctly ✓
- [ ] Jumbled word displays ✓
- [ ] Correct route shows year ✓
- [ ] Wrong routes show error messages ✓
- [ ] All buttons enable/disable as expected ✓
- [ ] Back buttons work between sub-phases ✓
- [ ] Proceeded to Phase 2 successfully ✓

## Code Files Modified

**Frontend**:
- `frontend/src/pages/Phase1.jsx` - Main Phase 1 page with sub-phases
- `frontend/src/pages/QRArticle.jsx` - Article display page
- `frontend/src/App.jsx` - Added route for QR article

**Backend**:
- `backend/src/models/Officer.js` - Added Phase 1 fields
- `backend/src/controllers/participantController.js` - New endpoints
- `backend/src/routes/participantRoutes.js` - Route definitions
- `backend/sample-data/officers.json` - Officer data (10 examples)

## API Endpoints Added

- `GET /participants/phase1-story` - Get officer for Phase 1
- `GET /participants/article` - Get article content for QR
- `POST /participants/scan-qr` - Scan QR (existing, enhanced)

## Troubleshooting

**QR not showing article**:
- Ensure last link in `qrLinks` array is the valid one
- Check that officer is correctly assigned

**Puzzle pieces not visible**:
- Check `puzzlePieces` array has correct x, y coordinates
- Verify boardRef is mounting correctly

**Password not validating**:
- Verify DOB format is exactly DDMMYYYY
- No spaces or special characters

**Routes not working**:
- Check that exactly one route has `"isCorrect": true`
- Verify `routeOptions` array has 3 items

## Next Steps

1. ✅ Code is ready
2. ⏳ Generate 10 real QR codes
3. ⏳ Customize officers.json with your data
4. ⏳ Insert officers into MongoDB
5. ⏳ Test thoroughly
6. ⏳ Deploy to your event

## Need to Change Something?

- **Add more officers**: Copy an officer object, update fields
- **Change puzzle difficulty**: Adjust number of `puzzlePieces`
- **Change route options**: Edit `routeOptions` array
- **Change colors**: Edit `frontend/tailwind.config.js`

## Ready for Phase 2?

Once Phase 1 is working, let me know and we can build Phase 2!

---

**Issues or Questions?** Let me know what needs adjustment!
