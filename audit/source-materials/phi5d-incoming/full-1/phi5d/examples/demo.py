from lumina import LuminaOrchestrator
r=LuminaOrchestrator().process_request('Create a secure, inclusive system','compassion')
print(r['response']); print(r['intent_pattern']); print(r['code_generated'])
