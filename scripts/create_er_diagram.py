from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib import colors

out=Path(__file__).resolve().parents[1]/'docs'
out.mkdir(exist_ok=True)
c=canvas.Canvas(str(out/'diagrama_er.pdf'),pagesize=(1120,800))
c.setTitle('Activity 7 Diagrama ER Escuela de robotica')
c.setAuthor('Leonardo H.')
c.setFillColor(colors.HexColor('#152d40'));c.setFont('Helvetica-Bold',23)
c.drawString(40,752,'Activity 7  Escuela de robótica')
c.setFillColor(colors.HexColor('#4b6478'));c.setFont('Helvetica',12)
c.drawString(40,730,'Modelo relacional de seis entidades · Claves, relaciones y cardinalidades')

def entity(x,y,w,h,name,rows):
    c.setFillColor(colors.white);c.setStrokeColor(colors.HexColor('#9eb2c2'))
    c.roundRect(x,y,w,h,8,fill=1,stroke=1)
    c.setFillColor(colors.HexColor('#163d59'));c.roundRect(x,y+h-38,w,38,8,fill=1,stroke=0)
    c.rect(x,y+h-38,w,18,fill=1,stroke=0)
    c.setFillColor(colors.white);c.setFont('Helvetica-Bold',14);c.drawString(x+14,y+h-25,name)
    c.setFont('Helvetica',11)
    for i,row in enumerate(rows):
        c.setFillColor(colors.HexColor('#163d59') if 'PK' in row else colors.HexColor('#273d4e'))
        c.drawString(x+14,y+h-61-22*i,row)

def relation(points,left,right,label,label_xy):
    c.setStrokeColor(colors.HexColor('#3a718f'));c.setLineWidth(1.7)
    p=c.beginPath();p.moveTo(*points[0])
    for point in points[1:]:p.lineTo(*point)
    c.drawPath(p)
    c.setFont('Helvetica-Bold',12);c.setFillColor(colors.HexColor('#163d59'))
    c.drawString(*left[0],left[1]);c.drawString(*right[0],right[1])
    c.setFont('Helvetica',11);c.drawString(*label_xy,label)

entity(40,485,300,205,'users',[
 'id  INT UNSIGNED  PK', 'name  VARCHAR(100)', 'email  VARCHAR(150)  UQ',
 'role  ENUM  NOT NULL', 'group_id  INT UNSIGNED  FK  NULL'])
entity(40,120,300,155,'groups',[
 'id  INT UNSIGNED  PK','name  VARCHAR(50)  UQ'])
entity(410,120,300,155,'group_courses',[
 'group_id  INT UNSIGNED  PK, FK','course_id  INT UNSIGNED  PK, FK'])
entity(410,445,300,245,'courses',[
 'id  INT UNSIGNED  PK','code  VARCHAR(20)  UQ', 'title  VARCHAR(150)',
 'cover_url  VARCHAR(255)', 'content  TEXT',
 'robotics_kit_id  INT UNSIGNED  FK', 'didactic_material_id  INT UNSIGNED  FK, UQ'])
entity(780,535,300,155,'robotics_kits',[
 'id  INT UNSIGNED  PK', 'name  VARCHAR(100)  UQ'])
entity(780,120,300,175,'didactic_materials',[
 'id  INT UNSIGNED  PK', 'title  VARCHAR(150)', 'file_url  VARCHAR(255)'])

relation([(190,275),(190,485)],((139,287),'0..1*'),((140,465),'0..N'),'pertenencia',(207,378))
relation([(340,197),(410,197)],((345,208),'1'),((372,175),'0..N'),'asigna',(347,229))
relation([(560,275),(560,445)],((573,287),'0..N'),((575,425),'1'),'curso asignado',(576,355))
relation([(710,610),(780,610)],((715,589),'0..N'),((760,589),'1'),'kit',(735,629))
relation([(710,480),(746,480),(746,207),(780,207)],((712,493),'0..1'),((762,220),'1'),'material principal',(762,385))

c.setFillColor(colors.HexColor('#173d59'));c.setFont('Helvetica-Bold',11)
c.drawString(40,85,'PK = clave primaria     FK = clave foránea     UQ = único     PK de group_courses = (group_id, course_id)')
c.setFont('Helvetica',10)
c.drawString(40,65,'* CHECK: student requiere exactamente un grupo; teacher y administrator requieren group_id NULL.')
c.drawString(40,48,'Cada curso requiere un kit y un material principal propio. Groups y courses forman una relación N:M mediante group_courses.')
c.drawString(40,31,'Todas las tablas incluyen created_at y updated_at (DATE/DATETIME NOT NULL); se omiten en los cuadros para facilitar la lectura.')
c.save()
print(out/'diagrama_er.pdf')
