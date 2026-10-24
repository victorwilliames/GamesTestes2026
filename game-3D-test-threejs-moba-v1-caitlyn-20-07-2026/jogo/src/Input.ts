import * as THREE from 'three';

export class InputManager {
  public mouseX: number = window.innerWidth / 2;
  public mouseY: number = window.innerHeight / 2;
  
  public mouse3D: THREE.Vector3 = new THREE.Vector3();
  public keys: { [key: string]: boolean } = {};
  
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse2D: THREE.Vector2 = new THREE.Vector2();
  
  // Callbacks para ações rápidas
  public onRightClick: (point: THREE.Vector3, targetEntity: any | null) => void = () => {};
  public onKeyPress: (key: string) => void = () => {};
  
  constructor(private camera: THREE.Camera, private groundMesh: THREE.Object3D, private getClickableEntities: () => THREE.Object3D[]) {
    // Escuta de teclado
    window.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      this.keys[key] = true;
      this.onKeyPress(key);
      
      // Impede comportamento padrão de atalhos do navegador que conflitam
      if (['SPACE', 'F1', 'Q', 'W', 'E', 'R'].includes(key) || e.key === ' ') {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      const key = e.key.toUpperCase();
      this.keys[key] = false;
    });
    
    // Movimento do mouse
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      this.mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      this.updateMouse3D();
    });
    
    // Bloqueia o menu de contexto padrão do clique direito
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Cliques do mouse
    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Clique Direito
        this.handleRightClick();
      }
    });
  }
  
  private updateMouse3D() {
    this.raycaster.setFromCamera(this.mouse2D, this.camera);
    const intersects = this.raycaster.intersectObject(this.groundMesh, true);
    
    if (intersects.length > 0) {
      this.mouse3D.copy(intersects[0].point);
    }
  }
  
  private handleRightClick() {
    this.raycaster.setFromCamera(this.mouse2D, this.camera);
    
    // Primeiro, verifica se clicamos em alguma entidade selecionável (Inimigo, Minion, Torre)
    const entities = this.getClickableEntities();
    const intersectsEntities = this.raycaster.intersectObjects(entities, true);
    
    if (intersectsEntities.length > 0) {
      // Encontra a entidade correspondente na árvore
      let obj: THREE.Object3D | null = intersectsEntities[0].object;
      let targetEntity: any = null;
      
      while (obj) {
        if ((obj as any).userData && (obj as any).userData.entity) {
          targetEntity = (obj as any).userData.entity;
          break;
        }
        obj = obj.parent;
      }
      
      if (targetEntity && targetEntity.team !== 1) { // Inimigo ou neutro
        this.onRightClick(intersectsEntities[0].point, targetEntity);
        return;
      }
    }
    
    // Se não clicou em entidade, pega a interseção com o chão
    const intersectsGround = this.raycaster.intersectObject(this.groundMesh, true);
    if (intersectsGround.length > 0) {
      this.onRightClick(intersectsGround[0].point, null);
    }
  }
}
