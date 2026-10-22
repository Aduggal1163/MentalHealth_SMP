from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "online"
    print("✓ test_root passed")


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "status" in data
    assert "api_key_configured" in data
    print("✓ test_health passed")


def test_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    categories = response.json()
    assert len(categories) == 6, f"Expected 6 categories, got {len(categories)}"
    names = [c["name"] for c in categories]
    assert "Jobs/Career" in names
    assert "Relationship" in names
    assert "Bias/Abuse" in names
    assert "Medication" in names
    assert "Alienation" in names
    assert "No Reason" in names
    print("✓ test_categories passed")


def test_samples():
    response = client.get("/api/samples")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    samples = response.json()
    assert len(samples) >= 6
    assert any(s["category"] == "Jobs/Career" for s in samples)
    print("✓ test_samples passed")


def test_knowledge_base():
    response = client.get("/api/knowledge-base")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    kb = response.json()
    assert "collection_name" in kb
    assert "chunk_count" in kb
    print("✓ test_knowledge_base passed")


def test_analyze_invalid_empty():
    response = client.post("/api/analyze", json={"post": ""})
    assert response.status_code in [400, 422], f"Expected 400 or 422, got {response.status_code}"
    print("✓ test_analyze_invalid_empty passed")


def test_analyze_valid_post():
    test_post = "I worked 80 hours this week and my manager yelled at me. I feel burned out and anxious."
    response = client.post("/api/analyze", json={"post": test_post})
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["mental_health_related"] is True
    assert data["contributing_factor"] == "Jobs/Career"
    assert len(data["relevant_phrases"]) > 0
    assert "explanation" in data
    assert "limitations" in data
    assert len(data["sources"]) > 0
    print("✓ test_analyze_valid_post passed")


def test_history_flow():
    # Fetch history
    res = client.get("/api/history")
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)

    # Clear history
    del_res = client.delete("/api/history")
    assert del_res.status_code == 200

    # Verify cleared
    res_after = client.get("/api/history")
    assert res_after.json() == []
    print("✓ test_history_flow passed")


def test_batch_analyze():
    posts = [
        "My relationship ended after 5 years and I feel completely alone and heartbroken.",
        "Beautiful morning for a coffee and a coding session with friends."
    ]
    response = client.post("/api/analyze/batch", json={"posts": posts})
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["total_posts"] == 2
    assert "Relationship" in data["factors_distribution"]
    assert len(data["results"]) == 2
    print("✓ test_batch_analyze passed")


def run_all_tests():
    print("=" * 50)
    print("STARTING BACKEND TESTS")
    print("=" * 50)
    test_root()
    test_health()
    test_categories()
    test_samples()
    test_knowledge_base()
    test_analyze_invalid_empty()
    test_analyze_valid_post()
    test_batch_analyze()
    test_history_flow()
    print("=" * 50)
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 50)


if __name__ == "__main__":
    run_all_tests()
