import argparse, json
from .agents import LuminaOrchestrator

def main():
    p=argparse.ArgumentParser(description='LUMINA Phi-5D Photonic Intelligence')
    p.add_argument('request',nargs='?',default='Create a secure system that honors all boundaries')
    p.add_argument('--feeling',default='compassion',choices=['clarity','compassion','joy','protection','healing','wisdom','shadow'])
    p.add_argument('--json',action='store_true'); a=p.parse_args(); r=LuminaOrchestrator().process_request(a.request,a.feeling)
    if a.json: print(json.dumps(r,default=lambda o:o.__dict__,indent=2,ensure_ascii=False))
    else: print(r['response']); print(r['code_generated'])
if __name__=='__main__': main()
