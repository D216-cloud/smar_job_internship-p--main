@echo off
echo Starting SmartHire Application...
echo.

echo Installing frontend dependencies...
npm install

echo.
echo Installing backend dependencies...
cd backend
npm install
cd ..

echo.
echo Seeding database with sample data...
cd backend
npm run seed
cd ..

echo.
echo Starting both servers...
echo Frontend will be available at: http://localhost:5173/
echo Backend will be available at: http://localhost:5000/
echo.

npm run dev:full 