import {P,fill,stroke,layer} from './geometry.js';
import {material,scratches,chains} from './materials.js';
import {armAngle,localBodyPose} from './rig-adapter.js';
export const ANCHORS={neck:[0,531],leftShoulder:[-147,600],rightShoulder:[147,600],leftElbow:[-222,662],rightElbow:[222,662],leftWrist:[-279,752],rightWrist:[279,752],hip:[0,751],leftHip:[-89,754],rightHip:[89,754],leftKnee:[-103,862],rightKnee:[103,862],leftAnkle:[-104,938],rightAnkle:[104,938],leftWeapon:[-283,752],rightWeapon:[283,752],scarf:[25,530],cape:[121,542]};
const skin=(ctx,d,seed,box)=>material(ctx,d,{base:P.skin,shadow:P.skinDark,light:'#ffcb91',kind:'skin',seed,box,ink:3.4,texture:1.15});
const leather=(ctx,d,seed,box,base=P.leather)=>material(ctx,d,{base,shadow:'#150f15',kind:'leather',seed,box,ink:3.4,texture:1.15});
const cloth=(ctx,d,seed,box,base=P.red)=>material(ctx,d,{base,shadow:P.redShadow,kind:'cloth',seed,box,ink:3.5,texture:1.1});
export function paintCape(ctx){
 cloth(ctx,'M 105 536 Q 171 528 198 574 Q 268 608 334 629 L 397 648 Q 357 652 375 683 L 425 724 Q 357 704 318 715 L 375 765 Q 291 736 236 735 L 277 791 Q 204 766 179 717 Q 118 695 92 620 Z',401,[90,532,341,263],P.red);
 fill(ctx,'M 152 569 Q 243 621 338 654 Q 276 659 224 640 Q 303 684 344 713 Q 248 694 177 648 Z','#dd1719');
 fill(ctx,'M 190 631 Q 260 680 374 713 L 345 711 Q 274 695 228 683 Z','#6e0713');
 scratches(ctx,['M 160 576 Q 244 614 334 641','M 193 607 Q 266 648 358 667','M 169 651 Q 245 694 330 708','M 209 686 Q 258 722 294 732'],'#ed4632',3);
}
export function paintLegs(ctx,pose='neutral'){for(const side of [-1,1])paintLeg(ctx,side,pose)}
export function paintLeg(ctx,side,pose='neutral'){
 ctx.save();ctx.translate(side*89,754);ctx.scale(side,1);ctx.rotate(pose==='run'?(side<0?.11:-.11):pose==='attack'?(side<0?-.08:.08):0);ctx.translate(-89,-754);
 skin(ctx,'M 46 780 Q 96 769 142 796 L 151 848 Q 134 896 111 918 L 60 915 Q 53 869 42 836 Z',500+(side+1)*10,[39,780,120,146]);
 // dark wrapped greaves and massive layered boots.
 leather(ctx,'M 58 836 Q 103 825 148 838 Q 168 876 154 926 L 163 994 Q 129 1033 38 1019 Q 20 983 41 948 Z',520+(side+1)*10,[24,823,149,209],'#3a2725');
 material(ctx,'M 43 951 Q 82 921 125 942 Q 174 948 183 985 Q 190 1016 150 1025 L 30 1021 Q 19 996 43 951 Z',{base:'#4c312d',shadow:'#221718',kind:'leather',box:[23,922,170,106],seed:542+(side+1)*3,ink:4.2});
 // Toe patches: angular stitched leather rather than smooth oval.
 leather(ctx,'M 54 974 Q 77 949 118 950 Q 155 956 162 987 L 151 1005 L 45 1005 Q 41 987 54 974 Z',565+(side+1)*8,[44,946,121,63],'#72503b');
 stroke(ctx,'M 39 1010 Q 92 1019 178 1007','#130f13',8);stroke(ctx,'M 36 1012 Q 91 1026 172 1017','#ab7451',2.8);
 // Múltiplas tiras de couro por cima da canela, sobrepostas.
 for(let i=0;i<4;i++){
 const y=850+i*24;
 leather(ctx,`M ${49-i*2} ${y} Q 98 ${y-16} ${152+i} ${y-9} L ${153+i} ${y+6} Q 102 ${y+1} ${44-i} ${y+22} Z`,590+i+(side+1)*5,[40,y-17,123,42]);
 stroke(ctx,`M 51 ${y+5} Q 102 ${y-8} 143 ${y-5}`,'#ac7251',1.45);
 }
 scratches(ctx,['M 66 980 L 109 956','M 88 998 L 129 983','M 57 1003 L 79 1001'],'#bb845e',1.2);
 ctx.restore();
}
export function paintTorso(ctx){
 // Torso descoberto, escapular e peitoral modelados manualmente, não cápsula.
 skin(ctx,'M -132 574 Q -156 586 -155 635 L -123 691 Q -116 737 -75 750 Q -14 773 69 749 Q 126 734 135 681 Q 155 609 124 574 Q 79 560 44 572 Q -11 587 -54 572 Q -102 556 -132 574 Z',602,[-158,560,312,212]);
 fill(ctx,'M -126 621 Q -76 602 -22 622 Q -44 668 -102 671 Q -129 649 -126 621 Z','#ffd09a');
 fill(ctx,'M 13 618 Q 83 605 117 624 Q 118 656 68 670 Q 18 670 13 618 Z','#ffd09a');
 fill(ctx,'M -120 648 Q -87 674 -34 662 L -56 693 Q -103 706 -127 672 Z','#d57a53');
 fill(ctx,'M 113 648 Q 85 672 38 667 L 56 690 Q 100 694 123 667 Z','#d37a51');
 fill(ctx,'M -32 672 L -1 683 L 32 668 L 20 704 L -9 718 L -29 703 Z','#d98157');
 fill(ctx,'M -71 715 Q -35 703 -7 716 Q 28 704 74 706 L 68 735 Q 28 745 1 738 Q -43 744 -70 732 Z','#e18b5f');
 stroke(ctx,'M -119 630 Q -75 651 -20 647','#ae5a43',2.4);stroke(ctx,'M 19 646 Q 81 651 112 630','#aa533d',2.4);
 stroke(ctx,'M -3 636 Q -9 674 -1 694','#ae5c45',2.1);stroke(ctx,'M -40 697 Q -14 687 0 698 Q 17 690 42 697','#ad5e46',2.2);
 stroke(ctx,'M -64 723 Q -23 714 0 722 Q 28 717 65 716','#b66f4e',2.2);
 // Abdômen com quatro volumes e sombras irregulares, nunca um único preenchimento liso.
 fill(ctx,'M -55 684 Q -36 692 -9 684 L -13 702 Q -34 713 -58 703 Z','#f3b47e');
 fill(ctx,'M 7 684 Q 33 695 56 682 L 57 702 Q 37 714 12 705 Z','#ffbe87');
 fill(ctx,'M -50 707 Q -31 714 -8 708 L -9 724 Q -37 733 -49 721 Z','#eaa06b');
 fill(ctx,'M 11 710 Q 30 713 50 706 L 47 723 Q 24 736 14 724 Z','#e99a66');
 stroke(ctx,'M -60 706 Q -36 708 -14 706 M 12 706 Q 41 710 59 703','#b66b4d',2.25);
 stroke(ctx,'M -62 730 Q -31 737 -4 729 M 7 729 Q 31 737 61 727','#b4714e',1.8);
 stroke(ctx,'M -30 674 Q -20 689 -20 704 M 34 672 Q 26 691 29 703','#d47750',1.5);

 fill(ctx,'M -88 635 Q -83 629 -78 639 Q -81 646 -87 642 Z','#b97856');fill(ctx,'M 84 637 Q 92 628 96 640 Q 95 647 87 646 Z','#b97856');
}
// Braços recebem transformada local no OMBRO. O T-pose é apenas um parâmetro estático.
export function paintArm(ctx,side,pose='neutral'){
 ctx.save();ctx.translate(side*143,594);ctx.scale(side,1);
 // deslocamento da geometria da peça (braço direito tem orientação positiva local)
 ctx.rotate(armAngle(pose,side));
 skin(ctx,'M -4 -12 Q 20 -18 42 11 Q 70 50 71 76 L 112 120 Q 130 139 143 159 Q 125 192 90 185 L 55 137 Q 32 109 15 84 Q -5 62 -17 24 Z',700+side*3,[-20,-20,170,215]);
 fill(ctx,'M 23 19 Q 59 53 48 84 Q 33 88 25 70 Z','#ffc18c');
 fill(ctx,'M 51 81 Q 71 89 78 113 L 66 126 L 50 105 Z','#bb6a4c');
 stroke(ctx,'M 40 35 Q 65 65 53 89','#ce714b',2);
 // Camadas sobre o antebraço. Textura preso à superfície local.
 for(let i=0;i<4;i++){
   const d=[
   'M 52 79 Q 75 67 92 91 L 101 104 Q 83 100 65 113 L 55 106 Z',
   'M 66 103 Q 88 88 107 115 L 118 129 Q 97 121 80 141 Z',
   'M 83 128 Q 101 112 122 133 L 131 147 Q 113 145 97 162 Z',
   'M 99 152 Q 116 135 137 153 L 144 169 Q 128 162 112 183 Z'
   ][i];leather(ctx,d,721+i*7+side*7,[52+i*16,65+i*24,96,65],i%2?'#402c29':'#392625');
 }
 // Punching fist, not an oval fist.
 // Wrist underlying the gripping hand is drawn here; outer fingers are painted over the grip.
 skin(ctx,'M 117 146 Q 143 134 164 154 Q 175 171 160 187 L 125 196 Q 101 183 109 162 Z',782+side*4,[101,140,77,69]);
 stroke(ctx,'M 149 157 Q 140 172 146 188','#a85b3e',2.5);stroke(ctx,'M 160 162 Q 154 174 158 181','#bd6945',1.9);
 leather(ctx,'M 113 159 L 133 149 L 142 162 L 121 186 L 107 178 Z',793+side*3,[104,145,43,47]);
 ctx.restore();
}
export function paintCloth(ctx){
 // Saiote irregular de tecido pesado, em múltiplos panos individuais.
 leather(ctx,'M -120 747 Q -42 755 2 752 Q 62 757 121 747 L 134 781 L 120 825 L 84 817 L 69 853 L 37 832 L 10 874 L -12 842 L -51 862 L -61 835 L -101 840 L -92 818 L -131 801 Z',807,[-134,739,275,143],'#382829');
 fill(ctx,'M -107 773 L -89 830 L -61 809 L -46 858 L -30 792 L -7 853 L 23 786 L 44 838 L 79 782 L 106 816 L 112 758 Z','#271c1f');
 scratches(ctx,['M -111 785 L -86 813','M -73 784 L -55 821','M -20 777 L -19 815','M 28 779 L 38 808','M 94 783 L 81 823'],'#876252',2.5);
 // Bandanas vermelhas rasgadas abaixo do cinto.
 cloth(ctx,'M -89 737 Q -35 724 -10 752 L -47 840 L -57 808 L -75 822 L -66 784 L -110 803 Z',811,[-112,720,110,132]);
 cloth(ctx,'M -11 749 L 42 745 Q 23 821 8 881 L -4 846 L -16 858 L -25 791 Z',812,[-27,743,72,139],P.redLight);
 cloth(ctx,'M 42 749 L 108 741 L 119 793 L 83 777 L 75 813 L 61 776 L 45 798 Z',813,[35,739,91,80],P.red);
 // Cinto com faixas grossas, esquerda/direita e correntes.
 leather(ctx,'M -123 728 Q -57 715 2 722 Q 70 715 128 730 L 123 757 Q 69 746 0 752 Q -58 750 -119 763 Z',831,[-125,713,257,53],'#302022');
 cloth(ctx,'M -126 727 Q -45 710 -5 730 L -4 745 Q -80 734 -127 749 Z',833,[-127,709,124,43],P.red);
 cloth(ctx,'M 8 729 Q 67 709 123 730 L 129 749 Q 66 728 8 748 Z',834,[7,709,124,40]);
 chains(ctx,-65,762,-151,790,1);chains(ctx,63,764,150,792,1);
 // ÚNICA caveira do herói, no centro do cinto. Não reaparece em outra região.
 material(ctx,'M -34 712 Q -23 695 -1 697 Q 23 696 35 717 Q 40 736 25 748 L 19 761 L 12 758 L 8 766 L -1 760 L -11 766 L -16 756 L -24 762 L -26 747 Q -45 736 -34 712 Z',{base:P.bone,shadow:P.boneDark,kind:'bone',box:[-44,696,82,71],seed:851,ink:3.6});
 fill(ctx,'M -28 724 Q -22 713 -11 719 Q -5 730 -17 738 L -26 735 Z','#241a1c');fill(ctx,'M 10 721 Q 24 712 31 722 L 23 740 Q 10 738 10 721 Z','#241a1c');fill(ctx,'M -4 738 L 0 732 L 7 742 Q 0 748 -4 738 Z','#2b1a1c');
 stroke(ctx,'M -11 749 L -10 757 M -1 748 L 0 759 M 9 749 L 10 757','#59413b',2);
}
export function paintScarf(ctx){
 cloth(ctx,'M -128 508 Q -67 517 0 520 Q 86 514 133 503 L 143 544 Q 98 595 16 610 Q -71 614 -131 564 L -152 549 Z',904,[-158,496,306,122],P.redLight);
 fill(ctx,'M -135 541 Q -66 579 16 583 Q 96 580 139 539 L 126 564 Q 50 612 -26 596 Q -104 588 -141 559 Z','#800b16');
 cloth(ctx,'M -131 552 Q -61 574 5 569 Q 95 568 132 545 L 120 574 Q 45 622 -45 599 Q -105 591 -131 568 Z',906,[-135,538,268,76]);
 fill(ctx,'M -114 558 Q -56 580 5 578 Q 78 579 117 552 Q 89 582 25 588 Q -73 592 -114 570 Z','#ef3327');
 stroke(ctx,'M -133 542 Q -33 576 128 535','#5b0910',3.5);stroke(ctx,'M -106 585 Q 1 614 111 580','#f84736',2.3);
 scratches(ctx,['M -93 550 L -58 558','M -63 577 L -14 590','M 37 581 L 79 567','M -104 566 L -75 575'],'#ff6147',1.8);
}
