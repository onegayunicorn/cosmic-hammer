from lumina import *
def test_constants(): assert round(PHI,8)==1.61803399 and FREQ_ANCHOR==432

def test_decode_requires_lock():
    s=TachyonDNAStrand('x','law',432,1,0)
    assert s.decode(0) is None and s.decode(GOLDEN_ANGLE)

def test_transducer():
    c=Phi5DCrystalCore(); p=c.feeling_to_intent_pattern('compassion','build secure system')
    assert p.glyph=='∞' and p.frequency_hz==432

def test_ethics():
    c=Phi5DCrystalCore(); assert not c.ethical_check('x',['a'],[False])['allowed']; assert c.ethical_check('x',['a'],[True])['allowed']

def test_paths_probability():
    paths=Phi5DCrystalCore().see_possible_paths('x'); assert abs(sum(p['probability'] for p in paths)-1)<1e-9

def test_orchestration():
    r=LuminaOrchestrator().process_request('create a boundary-safe system','protection'); assert r['status']=='RESONATING' and r['code_generated']
