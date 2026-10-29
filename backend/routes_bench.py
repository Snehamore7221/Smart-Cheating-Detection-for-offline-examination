from fastapi import APIRouter
from bench_mapping.bench_mapper import BenchMapper

router = APIRouter(prefix="/api/benches", tags=["Bench Mapping"])

bench_mapper = BenchMapper()

@router.get("", summary="Get configured bench ROIs")
async def get_bench_mappings():
    """Returns configured bench ROI polygons and IDs."""
    benches = bench_mapper.get_all_benches()
    return {"success": True, "benches": benches}
