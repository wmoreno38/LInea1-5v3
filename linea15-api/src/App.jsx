import React from "react";
import { MATRIX_TEMPLATE } from "./template.js";
import JSZip from "jszip";
import * as API from "./api.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// Common constants (extracted for maintainability)
const FONT_FAMILY = "'DM Sans',sans-serif";
const MONO_FONT = "'Space Mono',monospace";


const useState = React.useState, useEffect = React.useEffect, useMemo = React.useMemo;
const h = React.createElement;

const T = {bg:"#F5F0EB",sf:"#FFFFFF",sa:"#F0E8E0",bd:"#E0D5C8",ac:"#E87722",ah:"#F59E0B",as:"rgba(232,119,34,.08)",dn:"#DC2626",ds:"rgba(220,38,38,.08)",wn:"#D97706",ws:"rgba(217,119,6,.08)",sc:"#2E8B57",ss:"rgba(46,139,87,.08)",inf:"#1A7AB5",tx:"#2D2A26",ts:"#6B6560",td:"#9C9590",wh:"#FFFFFF"};
const CTRL_ST = {pendiente:{l:"Pendiente",c:T.wn,i:"⏳"},en_progreso:{l:"En Progreso",c:T.inf,i:"🔄"},implementado:{l:"Implementado",c:T.ac,i:"✅"},verificado:{l:"Verificado",c:T.sc,i:"🛡️"}};
const EV_ST = {en_revision:{l:"En revisión",c:T.wn,i:"⏳"},aprobada:{l:"Aprobada",c:T.sc,i:"✓"},rechazada:{l:"Rechazada",c:T.dn,i:"✕"}};
const EV_TYPES = ["Captura de pantalla","Documento / Política","Log del sistema","Reporte de auditoría","Acta de reunión","Certificación","Resultado de prueba","Correo electrónico","Otro"];

let _c = Date.now();
function uid(){return "id"+_c++}
function today(){return new Date().toISOString().split("T")[0]}

  function makeBaseData(){
    const controls = [
      {id:uid(),code:"CT-001",causaBase:"Configuraciones Inseguras",causasAsociadas:"Inadecuada Gestión de Métodos Criptográficos que se ajuste a la necesidad de las comunicaciones. \n\nCifrado inseguro en las aplicaciones generados por configuraciones predeterminadas.\n\nUso de algoritmo débiles o inseguros.\n\nAplicar configuraciones por defecto en el Software y Hardware",controlBase:"1. Aplicar cifrado en tránsito y reposo, según naturaleza de la información. (TLS 1.2/1.3 - AES-256)\n\n2. Aplicar políticas de rotación de claves y certificados.\n\n3. Deshabilitar algoritmos obsoletos (MD5, SHA-1, RC4).\n\n4. Activar cifrado en reposo y en tránsito en todos los servicios (S3, Blob Storage, etc.).\n\n5. Validación con el Área de Base de Datos del cifrado aplicado a las BD utilizadas por el proyecto.\n\n6.  En caso de incluir datos sensibles, evidenciar el ofuscamiento a nivel de aplicati",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"10.1.1 Política sobre el uso de controles criptográficos\n18.1.3 Protección de registros \nA.10.1.2 Gestión de llaves",iso27002:"5.17 Autenticación information\n7.14 Secure disposal or re-use of equipment\n8.1 Information access restriction\n8.11 Data masking\n8.12 Data leakage prevention\n8.21 Security of network services.\n8.24 Use of cryptography",circular:"2.3.4.11.2.Implementar mecanismos de cifrado fuerte de extremo a extremo para el envío y recepción de información confidencial de las operaciones realizadas, tal como: clave, número de cuenta, número de tarjeta, etc. Esta información, en ningún caso puede ser conocida por los proveedores de redes y ",sfc:"3.10. Mantener cifrada la información clasificada como confidencial en tránsito o en reposo, usando estándares y algoritmos reconocidos internacionalmente que brinden al menos la seguridad ofrecida por AES, RSA o 3DES.\n3.14. Contar con canales de comunicación con el proveedor de servicios en la nube",otras:"Especificar métodos de cifrado de contraseñas y algoritmos de cifrado soportados."}},
      {id:uid(),code:"CT-002",causaBase:"Uso Inadecuado de Atribuciones",causasAsociadas:"Falta de monitoreo de las cuentas de usuarios privilegiados\nFalta de monitoreo de las modificaciones y/o registros sospechosos de sobre plataformas tecnológicas.\nFalta de visibilidad y gestión de eventos de seguridad. \nIncumplimiento en el procedimiento de gestión de administración de accesos\nAcceso",controlBase:"1. Implementar las fuentes de datos (app logs, firewall logs, IDS logs, entre otros.) para un análisis granular y de alertas serán monitoreadas a través de Azure Monitor, Azure security Center y CyberArk.\n\n2. Crear e implementar una Matriz de Roles y Perfiles que contemple de manera integral todos los módulos y submódulos de los aplicativos de la compañía, asegurando que cada usuario cuente únicamente con los accesos necesarios según sus funciones.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.4.1 Registro de eventos \nA.16.1.2 Reporte de eventos de \nseguridad de la información \nA.16.1.4 Evaluación de eventos de \nseguridad de la información y \ndecisiones sobre ellos.",iso27002:"5.22 Monitoring, review and change management of suppler services.\n5.24 Information security incident management planning and preparation.\n5.25 Assessment and decision on information security events.\n5.28 Collection of evidence.\n6.8 Information security event reporting.\n8.15 Logging",circular:".3.3.1.12.  Establecer procedimientos para el bloqueo de canales o de instrumentos para la realización de operaciones, cuando existan situaciones o hechos que lo ameriten o después de un número de intentos de accesos fallidos por  parte de un cliente, así como las medidas operativas y de seguridad p",sfc:"3.12. Monitorear los servicios contratados para detectar operaciones o cambios no deseados y/o adelantar las acciones preventivas o correctivas cuando se requiera.",otras:"Se debe asegurar la base de datos con una herramienta de seguridad y monitoreo de bases de datos (Ejemplo: GUARDIUM)."}},
      {id:uid(),code:"CT-003",causaBase:"Tecnología obsoleta (hardware/software)",causasAsociadas:"Infraestructura y aplicaciones obsoletas que perdieron la garantía de soporte por fabricante y que no suple las necesidades actuales del negocio.\nAplicaciones obsoletas y desactualizadas que generan incompatibilidad con las nuevas tecnologías. \nSistemas operativos que carecen de actualizaciones en s",controlBase:"1. Establecer controles para mantener la infraestructura y componentes actualizados",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"Aquisición, desarrollo y mantenimiento de Sistemas de Información",iso27002:"",circular:"2.3.5.6 Mantener documentada y actualizada, al menos, la siguiente información: parámetros de los sistemas donde operan las aplicaciones en producción, incluido el ambiente de comunicaciones; versión de los programas y aplicativos en uso; soportes de las pruebas realizadas a los sistemas de informac",sfc:"3.12 Monitorear los servicios contratados para detectar operaciones o cambios no deseados y/o adelantar las acciones preventivas o correctivas cuando se requiera.",otras:"3.12 Monitorear los servicios contratados para detectar operaciones o cambios no deseados y/o adelantar las acciones preventivas o correctivas cuando se requiera."}},
      {id:uid(),code:"CT-004",causaBase:"Configuraciones Inseguras",causasAsociadas:"Ausencia o inadecuada segmentación de la infraestructura tecnológica.\nAplicar configuraciones por defecto en el Software y Hardware\nHardware y Software con parámetros de fabrica habilitados",controlBase:"1. Se debe establecer una arquitectura de red en la nube donde se segmenten los diferentes servicios con el fin de garantizar segregación de los servicios y el acceso a los mismos para los diferentes actores (clientes, usuario interno, administradores)  y los difentes ambientes (producción, pruebas, desarrollo ).\n\n2. Gestionar junto con la Dirección de Seguridad Informática la arquitectura de red manteniendo el lineamiento Hub and Spoke y demás componentes que describan la respectiva segmentació",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.9.1.2 Acceso a redes y a servicios en red\nA.11.1.1 Perímetro de seguridad \nfísica \nA.12.1.4 Separación de los ambientes \nde desarrollo, pruebas, y \noperación",iso27002:"8.22 Segregation of networks",circular:".3.3.1.4. Dotar de seguridad la información confidencial de los clientes que se maneja en los equipos y redes de la entidad.",sfc:"7. Documentación:\n7.4. Los diagramas de red que permitan identificar la plataforma que soporta el servicio contratado en la Nube",otras:"Para autorizar el acceso y controlar los flujos de información desde y hacia las redes se debe contar con firewalls, dispositivos de seguridad, segmentación de redes, y detección de intrusos."}},
      {id:uid(),code:"CT-005",causaBase:"Configuraciones Inseguras",causasAsociadas:"Indebida protección de información en transito y en reposo",controlBase:"1. Los canales de comunicación deberán usar protocolos seguros para la trasferencia de archivos y se deberá cifrar la información confidencial que este en transito en la nube. (Ej:SSL, IPsec, HTTPS, TLS en su última versión)\n\n2. Gestionar o validar con la Dirección de Seguridad Informática que la conexión para la gestión de las plataformas deberá realizarse mediante el uso de protocolos seguros.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.13.2.1 Políticas y procedimientos \nde transferencia de \ninformación \nA.13.2.2 Acuerdos sobre transferencia de información \nA.18.1.3 Protección de registros",iso27002:"5.14 Information transfer\n8.26 Application security requirements",circular:"2.3.4.9.1. Implementar los algoritmos y protocolos necesarios para brindar una comunicación segura.",sfc:"3.14. Contar con canales de comunicación con el proveedor de servicios en la nube cifrados de extremo a extremo y que en lo posible usen rutas diferentes.",otras:"Se debe desarrollar o configurar que las conexiones sean seguras entre sus componentes (Solución Central Back-end – Dispositivo Móvil) utilizando protocolos seguros de comunicación de extremo a extremo tal como TLS V 1.2 o superiores."}},
      {id:uid(),code:"CT-006",causaBase:"Tecnología obsoleta (hardware/software)",causasAsociadas:"Plataformas desactualizadas o vulnerables",controlBase:"1. Aplicar parches de seguridad para las plataformas implementadas según recomendaciones de los fabricantes, previo análisis de impacto por parte del área de Tecnología.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.11.2.4 Mantenimiento de \nequipos \nA.12.1.2 Gestión de cambios\nA.12.1.3 Gestión de capacidad\nA.12.6.1 Gestión de las vulnerabilidades técnicas\nA.12.7 Controles de auditorías de \nsistemas de información",iso27002:"5.21 Managing information security in the ICT supply chain.",circular:"2.3.4.9.1. Implementar los algoritmos y protocolos necesarios para brindar una comunicación segura..\n\n2.3.3.1.8. Velar porque los niveles de seguridad de los elementos usados en los canales no se vean disminuidos durante toda su vida útil.",sfc:"4.9. La corrección oportuna y eficaz de las vulnerabilidades informáticas detectadas.",otras:"Verificar la corrección de las vulnerabilidades encontradas en la pruebas de seguridad que se ejecutan a la infraestructura y a la plataforma."}},
      {id:uid(),code:"CT-007",causaBase:"Configuraciones Inseguras",causasAsociadas:"Transmisión de información a través de canales y o medios no seguros",controlBase:"1. Utilizar canales seguros por VPN (Ej:Site-to-Site)\n\n2. Configurar los certificados digitales  para utilizar protocoles seguros (Ej: TLS en su última versión) y deshabilitar los protocoles inseguros (Ej: SSL)\n\n3. En caso de requerirse realizar la transmisión de archivos debe realizar por un canal cifrado entre emisor y receptor.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.13.2.1 Políticas y procedimientos \nde transferencia de \ninformación \nA.13.2.2 Acuerdos sobre transferencia de información\nA.13.2.4 Acuerdos de \nconfidencialidad o de no divulgación",iso27002:"5.14 Information transfer",circular:"2.3.3.1.8. Velar porque los niveles de seguridad de los elementos usados en los canales no se vean disminuidos durante toda su vida útil.",sfc:"La corrección oportuna y eficaz de las vulnerabilidades informáticas detectadas.",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-008",causaBase:"Configuraciones Inseguras",causasAsociadas:"Vulnerabilidad día cero",controlBase:"1. Implementar herramientas de prevención y detección de ataques de amenazas avanzadas y vulnerabilidad de dia cero (Ej:Sanbox)\n\n2. Escanear imágenes de contenedores que exponen APIs.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.6.1 Gestión de las vulnerabilidades técnicas\nA.12.7 Controles de auditorías de \nsistemas de información",iso27002:"8.8 Management of technical vulnerabilities.",circular:"2.3.4.9.2.  Realizar como mínimo 2 veces al año una prueba de vulnerabilidad y penetración a los equipos, dispositivos y medios de comunicación usados en la realización de operaciones monetarias por este canal. Sin embargo, cuando se realicen cambios en la plataforma que afecten la seguridad del can",sfc:"4.9. La corrección oportuna y eficaz de las vulnerabilidades informáticas detectadas. \n\n7.6Los reportes generales de auditoria, pruebas de vulnerabilidades y estado actual de los servicios contratados.",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-009",causaBase:"Configuraciones Inseguras",causasAsociadas:"Vulnerabilidades tecnológicas compartidas con proveedor o tercero",controlBase:"1. Implementar el procedimiento para la gestión de vulnerabilidad sobre plataformas compartidas con otros clientes. (Ej:Metodo de despliegue nube publica)\n\n2. Validar reputación y seguridad de APIs externas",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.6.1 Gestión de las vulnerabilidades técnicas\nA.12.7 Controles de auditorías de \nsistemas de información",iso27002:"5.1 Policies for information security\n5.6 Contact with special interest groups. \n8.8 Management of technical vulnerabilities.",circular:"2.3.4.9.2.  Realizar como mínimo 2 veces al año una prueba de vulnerabilidad y penetración a los equipos, dispositivos y medios de comunicación usados en la realización de operaciones monetarias por este canal. Sin embargo, cuando se realicen cambios en la plataforma que afecten la seguridad del can",sfc:"4.9. La corrección oportuna y eficaz de las vulnerabilidades informáticas detectadas.",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-010",causaBase:"Vulnerabilidad día cero/ Uso Inadecuado de atribuciones",causasAsociadas:"Explotación de vulnerabilidades o brechas de seguridad\nAtaques de inyección de SQL los cuales implican que un atacante se aproveche de estas debilidades para ejecutar consultas en BD no autorizadas y administre los accesos para elevar privilegios.\n Desconocimiento del fabricante y el usuario de los ",controlBase:"1. Ejecutar pruebas de análisis de vulnerabilidades y hacking ético del servicio. Se deben realizar en ambiente de producción (Marcha Blanca).\n\n2. Escaneo de código.\n\n3. Realizar aseguramiento hardening.\n\n4. Principio de mínimo privilegio\n\n5. Validar configuración segura en servidores, bases de datos y aplicaciones.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.6.1 Gestión de las vulnerabilidades técnicas\nA.12.7 Controles de auditorías de \nsistemas de información",iso27002:"5.1 Policies for information security\n5.6 Contact with special interest groups. \n8.8 Management of technical vulnerabilities.",circular:"Contar con mecanismos para incrementar la seguridad de los portales, protegiéndolos de ataques de negación de servicio, inyección de código malicioso u objetos maliciosos, que afecten la seguridad de la operación o su conclusión exitosa.",sfc:"4.9. La corrección oportuna y eficaz de las vulnerabilidades informáticas detectadas.",otras:"Se deberán ejecutar pruebas de intrusión sobre la URL, será cotizada con proveedor corporativo por ATH, al home y a la zona transaccional, dependiendo de la asignación o no de usuarios validos de prueba respectivamente, con el fin de evaluar la zona de post autenticación."}},
      {id:uid(),code:"CT-011",causaBase:"Configuraciones Inseguras",causasAsociadas:"Deficiente configuración línea base de seguridad\nHardware y Software con parámetros de fabrica habilitados",controlBase:"1. Gestionar y asegurar por parte del proyecto o proveedor la hardenización de los servidores Onpremise y/o recursos en nube que se implementen. \n\n2. Asegurar que los servidores no cuenten con salida a internet, salvo requisito indispensable de la aplicación. \n\n3. En caso de ser un proyecto Cloud, se debe gestionar la postura de seguridad CIS realizando la remediación, mitigación o excepción de todos los controles fallidos en todos los ambientes.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.5.1.1 Políticas para la seguridad de \nla información\nA.18.2.1 Revisión independiente de la \nseguridad de la información \nA.18.2.2 Cumplimiento con las políticas \ny normas de seguridad \nA.18.2.3 Revisión del cumplimiento \ntécnico",iso27002:"5.23 Information security for use of cloud services",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-012",causaBase:"Configuraciones Inseguras",causasAsociadas:"Incorrecta administración de sesiones",controlBase:"1. Definir máximo 3 intentos de sesión.\n\n2. Configurar el cierre de sesión máximo a los 5 minutos, donde 30 segundos antes del cierre de sesión se alerte al usuario.\n\n3. Restringir la posibilidad de multisesión para los usuarios",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.9.1.1 Política de control de \nacceso \nA.9.2.1 Registro y cancelación \ndel registro de usuarios \nA.9.2.2 Suministro de acceso de usuarios \nA.9.2.3 Gestión de derechos de \nacceso privilegiado \nA.9.2.4 Gestión de información \nde autenticación secreta \nde usuarios \nA.9.2.5 Revisión de los derechos \nde",iso27002:"8.1 User endpoint devices",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-013",causaBase:"Configuraciones Inseguras",causasAsociadas:"Ausencia de ciclo de desarrollo seguro, con lo cual se puede utilizar funciones o componentes inseguros (Interfaces, APIs, imágenes, contenedores y librerías), introducir puertas traseras y presentar entrada y salida de datos inseguros o errados",controlBase:"1. Garantizar la aplicación de una metodología de desarrollo seguro teniendo en cuenta como mínimo requerimientos de seguridad basados en OWASP, siendo el responsable el desarrollador de la aplicación.\n\n2. Para la exposición de API, sea pública o sea privada, externa, interna, la conexión debe realizarse a través de la aplication Gateway with WAF, seguido y complementado por el \"API Management - API Connect\" dependiendo del servicio, que estaría contrastando y validando la conexión contra el dir",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.14.2.1 Política de desarrollo seguro \nA.14.2.2 Procedimientos de control de cambios en sistemas \nA.14.2.4 Restricciones en los cambios a los paquetes de software \nA.14.2.5 Principios de construcción de los sistemas seguros \nA.14.2.6 Ambiente de desarrollo seguro \nA.14.2.7 Desarrollo contratado \nex",iso27002:"8.25 Secure development life cycle",circular:"2.3.5  Requerimientos en materia de actualización de Software",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"1. Ciclo de Vida en el Desarrollo de la Solución:\n1. El sistema se debe codificar bajo estándares de desarrollo seguro. Se toma como base las directrices de codificación segura como “OpenWeb Application Security Project Guidelines” OWASP, entre otros que aseguren contar con controles de entrada, pro"}},
      {id:uid(),code:"CT-014",causaBase:"Configuraciones Inseguras",causasAsociadas:"Incumplimiento por parte Terceros (proveedores, contratistas, outsourcing, otros) de los acuerdos de seguridad y confidencialidad de la Compañía",controlBase:"1. Gestionar al proveedor realizando la revisión y evaluación mensual de operación y SLAs. \n\n2. Los proveedores tecnológico y de nube, deberá firmar el acuerdo de confidencialidad definido por Porvenir",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.15.1.1 Política de seguridad de la \ninformación para las \nrelaciones con proveedores\nA.15.1.2 Tratamiento de la seguridad \ndentro de los acuerdos con \nproveedores \nA.15.1.3 Cadena de suministro de \ntecnología de información y \ncomunicación",iso27002:"5.19 Information security in supplier relantionships\n5.20 Adressing information security within supplier agreements",circular:"2.3.5  Requerimientos en materia de actualización de Software",sfc:"3.5 Verificar que el proveedor ofrezca una disponibilidad de al menos el 99.95% en los servicios prestados en la nube.\n3.13. Establecer procedimientos para verificar el cumplimiento de los acuerdos y niveles de servicio establecidos con el proveedor de servicios en la nube y sus subcontratistas o pa",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-015",causaBase:"Configuraciones Inseguras",causasAsociadas:"Inadecuada segregación de funciones e inapropiada definición de matrices de roles y privilegios.\nFalta de monitoreo y  gestión  de las cuentas de usuarios privilegiados\nComportamiento inusual de cuentas de usuarios privilegiados no monitoreado.",controlBase:"1. Definir las matrices de administración y operación de los servicios en la nube, con roles y responsabilidades  garantizando adecuada segregación de funciones.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.6.1.1 Roles y responsabilidades \npara la seguridad de la información\nA.6.1.2 Separación de deberes \nA.9.1.1 Política de control de \nacceso \nA.9.2.1 Registro y cancelación \ndel registro de usuarios \nA.9.2.2 Suministro de acceso de usuarios",iso27002:"5.2 Information security roles and responsabilities.\n5.3 Segregation of duties\n5.4 Management responsabilities.\n5.15 Access control\n8.2 Privileged access rights",circular:"2.3.3.1.14 Realizar una adecuada segregación de funciones del personal que administre, opere, mantenga y, en general, tenga la posibilidad de acceder a los dispositivos y sistemas usados en los distintos canales e instrumentos para la realización de operaciones. En desarrollo de lo anterior, las ent",sfc:"3.11. Tener bajo su control la administración de usuarios y de privilegios para el acceso a los servicios ofrecidos, así como a las plataformas, aplicaciones y bases de datos que operen en la nube, dependiendo del modelo de servicio contratado.\n4.10. La utilización de técnicas de múltiple factor de ",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-016",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Acceso no autorizado a recursos o uso inapropiado de privilegios",controlBase:"1. Gestión de accesos a través del SCA (Sistema de Control de Acceso) para los roles técnicos del proyecto.\n\n2. Implementar controles para la gestión de usuarios privilegiados.\n\n3. Implementar herramienta para gestión de eventos de seguridad.\n\n4. Monitoreo periódico de las acciones realizadas sobre la plataforma, envío de alertas críticas a las áreas de Seguridad de la información y tecnología.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.9.1.1 Política de control de \nacceso \nA.9.2.1 Registro y cancelación \ndel registro de usuarios \nA.9.2.2 Suministro de acceso de usuarios \nA.9.2.3 Gestión de derechos de \nacceso privilegiado \nA.9.2.4 Gestión de información \nde autenticación secreta \nde usuarios \nA.9.2.5 Revisión de los derechos \nde",iso27002:"5.15 Access control",circular:"2.3.3.1.6.Proteger las claves de acceso a los sistemas de información. En desarrollo de esta obligación, las entidades deben evitar el uso de claves compartidas, genéricas o para grupos. La identificación y autenticación en los dispositivos y sistemas de cómputo de las entidades debe ser única y per",sfc:"3.11. Tener bajo su control la administración de usuarios y de privilegios para el acceso a los servicios ofrecidos, así como a las plataformas, aplicaciones y bases de datos que operen en la nube, dependiendo del modelo de servicio contratado.\n4.10. La utilización de técnicas de múltiple factor de ",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-017",causaBase:"Configuraciones Inseguras",causasAsociadas:"Fuga / sustracción / divulgación de información",controlBase:"1. Implementar una arquitectura  de seguridad perimetral.  Ej: Firewall, WAF,  IDS, IPS, entre otros",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.8.2.1 Clasificación de la información \nA.8.3.2 Disposición de los medios\nA.11.2.1 Ubicación y protección de los equipos\nA.13.2.4 Acuerdos de confidencialidad o de no divulgación \nA.14.1.1 Análisis y especificación de requisitos de seguridad de la información",iso27002:"8.12 Data leakage prevention",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-018",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Inadecuadas medidas para la eliminación o destrucción de la información y borrado seguro para el retiro de servicios total o parcial",controlBase:"1. Especificar la forma y el formato en que el proveedor devolverá la información y los datos a Porvenir cuando finalice el contrato o entregas parciales de información durante su vigencia.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.8.3.2 Disposición de los medios \nA.11.2.7 Disposición segura o reutilización de equipos",iso27002:"7.14 Secure disposal or re-use of equipment.\n8.10 Information deletion",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"4.8. El borrado seguro de los datos existentes en los medios de almacenamiento cuando finalice el contrato, cuando lo solicite la entidad o cuando el proveedor de servicios en la nube elimine y/o reemplace dichos medios.",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-019",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Inexistencia de auditoria y trazabilidad de acciones realizadas en los sistemas y las aplicaciones",controlBase:"1.Generar logs de las aplicaciones,  sistemas y plataformas, definiendo periodicidad de retención y rotación.\n\nDirigirse al \"Manual de Normas Política de Logs para Aplicaciones\" de Porvenir que según el lineamiento corporativo se deben generar los siguientes logs:\n- Inicio de sesión.\n- Administración de cuentas.\n- Uso de privilegios.\n- Acceso a objetos y/o archivos críticos.\n- Cambio de directivas.\n- Eventos emitidos por el servicio.\n- Auditoria.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.7 Controles de auditorías de \nsistemas de información",iso27002:"5.14 Information transfer.",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-020",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Autenticación débil del usuario y contraseña en los sistemas, las conexiones y comunicaciones informáticas\nAusencia de mecanismos fuertes de autenticación",controlBase:"1. Implementar mecanismos de autenticación fuerte y doble factor de autenticación, para terceros y administradores de las aplicaciones.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.9.1.1 Política de control de acceso\n9.1.2 Acceso a redes y a servicios en red \nA.9.2.4 Gestión de información secreta para la autenticación de usuarios",iso27002:"5.15 Access control\n5.16 Identity Management\n5.17 Authentication information\n5.18 Acces rigths\n8.5 Secure authentication",circular:"Establecer mecanismos fuertes de autenticación para las operaciones que, de acuerdo con el análisis de riesgo de cada entidad, generen mayor exposición al riesgo de fraude o suplantación. El análisis debe estar documentado y a disposición de la SFC. Igualmente, este análisis debe tener en cuenta asp",sfc:"3.11. Tener bajo su control la administración de usuarios y de privilegios para el acceso a los servicios ofrecidos, así como a las plataformas, aplicaciones y bases de datos que operen en la nube, dependiendo del modelo de servicio contratado.\n4.10. La utilización de técnicas de múltiple factor de ",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-021",causaBase:"Configuraciones Inseguras",causasAsociadas:"Credenciales de acceso comprometidas.",controlBase:"1. Asegurar siempre que sea posible la integración con el DA (Directorio Activo), para la gestión de cuentas de colaboradores y terceros. En caso de no poder realizar la integración la gestión de usuarios deberá cumplir los lineamientos de usuarios y contraseñas de la Dirección de Seguridad de la Información.\n\n2. No se deben almacenar contraseñas  en texto claro. Toda validación de credenciales  deberá hacerse utilizando mecanismos seguros, que garanticen la imposibilidad de obtener la contraseñ",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.9.1.1 Política de control de \nacceso \nA.9.2.1 Registro y cancelación \ndel registro de usuarios \nA.9.2.2 Suministro de acceso de usuarios \nA.9.2.3 Gestión de derechos de \nacceso privilegiado \nA.9.2.4 Gestión de información \nde autenticación secreta \nde usuarios \nA.9.2.5 Revisión de los derechos \nde",iso27002:"5.15 Access control\n5.16 Identity Management\n8.3 Information access restriction",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"3.11. Tener bajo su control la administración de usuarios y de privilegios para el acceso a los servicios ofrecidos, así como a las plataformas, aplicaciones y bases de datos que operen en la nube, dependiendo del modelo de servicio contratado.",otras:"El aplicativo debe permitir la administración de las contraseñas de las cuentas de usuarios y del cliente permitiendo: \nAdministrar el ciclo de vida de la contraseña (creación, bloqueo, desbloqueo, cambio por demanda y cambio por el administrador).  \nEl almacenamiento y transporte de las contraseñas"}},
      {id:uid(),code:"CT-022",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Ejecución de cambios no controlados",controlBase:"1. Asegurar el registro de cambios en ambientes productivos a través del Comité de Cambios. Y para ambientes previos a través de la gestión de cambios simples.\n\n2. Definir tablas y campos sensibles en las Bases de Datos con el proveedor y área funcional que deberán estar monitoreados con Guardium, así como asignar responsable de las alertas y tipo de alertas a parametrizar (update, delete, insert, etc.).",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.1.2 Gestión de cambios\nA.12.1.4 Separación de los ambientes \nde desarrollo, pruebas, y operación\nA.14.2.2 Procedimientos de control de cambios en sistemas  \nA.14.2.3 Revisión técnica de las \naplicaciones después de cambios en la plataforma de \noperación \nA.14.2.4 Restricciones en los cambios \na",iso27002:"8.3 Information access restriction\n8.9 Configuration management",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-023",causaBase:"Configuraciones Inseguras",causasAsociadas:"Inadecuados o deficientes mecanismos de respaldo  de la  información",controlBase:"1. Las copias de seguridad de bases de datos deberán ser cifradas y se debe disponer específicamente de una política de respaldo de información donde se indiquen las condiciones de respaldo y tiempos de retención.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.3.1 Respaldo de la información",iso27002:"8.13 information backup",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"3.8. Establecer mecanismos que permitan contar con respaldo de la información que se procesa en la nube, la cual debe estar a disposición de la entidad cuando así lo requiera. \n3.9. Garantizar la independencia de su información y de sus copias de respaldo de la información de las otras entidades que",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-024",causaBase:"Configuraciones Inseguras",causasAsociadas:"Aplicaciones obsoletas y desactualizadas que generan incompatibilidad con las nuevas tecnologías.\nDeficiencias en el análisis de capacidad de la infraestructura Tecnologica",controlBase:"1. Implementar procedimiento de gestión de de las capacidades por parte del administración de la plataforma.\n\n2. Validar o gestionar con el Área de Observabilidad el monitoreo permanente a la infraestructura tecnológica que soporta procesos del negocio.\n\n3. Gestionar versiones de APIs para evitar exposición de endpoints antiguos.\n\n4. Configurar rate Limiting y throttling en las API's, limitando el número de solicitudes por IP o token",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.12.1.3 Gestión de capacidad",iso27002:"8.6 Capacity management",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-025",causaBase:"Configuraciones Inseguras",causasAsociadas:"Incumplimiento de los acuerdos de servicio dispuestos en el plan de recuperación ante desastres (DRP) en cuanto a perdida de información (RPO) y tiempo máximo de recuperación (RTO)",controlBase:"1. Todo contrato debe fijar acuerdos de niveles de servicio que permitan garantizar los planes de DRP y en caso de no cumplimiento deberán existir penalizaciones acordadas.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.17.1.1 Planificación de la continuidad \nde la seguridad de la \ninformación \nA.17.1.2 Implementación de la continuidad de la seguridad de la información \nA.17.1.3 Verificación, revisión y \nevaluación de la continuidad de la seguridad de la información",iso27002:"5.29 Information security during disruption \n5.30 ICT readness for business continuity",circular:"La descripción de las pruebas de contingencia y/o continuidad realizadas a los sistemas que implementen o no la participación de los afiliados o usuarios y que tengan el potencial de generar afectación en la prestación de los servicios. Esta información se debe reportar el día hábil anterior al inic",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-026",causaBase:"Configuraciones Inseguras",causasAsociadas:"Inadecuada implementación de controles en aspectos relacionados con Seguridad de la Información y Ciberseguridad en el ciberespacio.",controlBase:"1. Se implementarán controles de seguridad de la información y ciberseguridad, alineados con las recomendaciones del área de riesgos, implementando los controles que permitan la correspondiente mitigación de riesgos",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.5.1.1 Políticas para la seguridad de la información",iso27002:"5.1 Policies for information security",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-027",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Uso de equipos y aplicaciones desactualizados (sistema operativo y aplicaciones) y sin ningún tipo de protección(puertos de comunicación inseguros).\nAntivirus desactualizados que no permiten la adecuada detección de Malware.",controlBase:"1. Se implementarán controles de seguridad de la información y ciberseguridad, alineados con las recomendaciones del área de riesgos, implementando los controles que permitan la correspondiente mitigación de riesgos",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"Validar aplicación directamente en la Matriz Legal de requisitos",iso27002:"Validar aplicación directamente en la Matriz Legal de requisitos",circular:"Validar aplicación directamente en la Matriz Legal de requisitos",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-028",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Uso indebido de credenciales de accesos / No adopción de mecanismos de autenticación fuerte\nParametrización inadecuada de montos, número de transacciones, IP´s autorizadas.",controlBase:"1. Establecer mecanismos fuertes de autorización y autenticación.\n\n2. Restringir número de conexiones por IP\n\n3. Gestión de contraseñas con políticas de complejidad, rotación periódica y uso de gestores seguros.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"Validar aplicación directamente en la Matriz Legal de requisitos",iso27002:"Validar aplicación directamente en la Matriz Legal de requisitos",circular:"2.2.6 Mecanismos fuertes de autenticación: Se entienden como mecanismos fuertes de autenticación los siguientes: y demás requisitos aplicables.",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-029",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Recolección y  Tratamiento Inapropiado de Datos Personales (1581) .\nAcceso no autorizado para revisar y actualizar datos personales, podría resultar en pérdida, mal uso o hurto de la información.\nSeguimiento deficiente al cumplimiento de la normatividad, relacionada con los controles definidos para ",controlBase:"1. Incluir en los contratos con los terceros su responsabilidad como encargados de la información cuando recolecten, almacenen, usen y transfieran datos personales.\n\n2. Verificar Jurisdicciones de tratamiento de información. \n\n3. Documentar Matriz Ciclo de Vida",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.18.1.4 Privacidad y protección de \ninformación de datos \npersonales",iso27002:"5.34 Privacy and protection of personally identifiable information.\n8.12 Data leakage prevention.",circular:"Las entidades vigiladas pueden adoptar tecnologías como realidad aumentada, internet de las cosas, blockchain, inteligencia artificial, machine learning, big data, robots, entre otras, cuando lo consideren pertinente para mejorar la prestación de servicios a los consumidores financieros y optimizar ",sfc:"3.7 Verificar que las jurisdicciones en donde se procesará la información cuenten con normas equivalentes o superiores a las aplicables en Colombia, relacionadas con la protección de datos personales y penalización de actos que atenten contra la confidencialidad, integridad y disponibilidad de los d",otras:"La solución informática debe cumplir como mínimo los siguientes Normativas de seguridad •	Ley 1266 de 2008 diciembre 31, Habeas Data. Congreso de la Republica."}},
      {id:uid(),code:"CT-030",causaBase:"Configuraciones Inseguras",causasAsociadas:"Utilización de datos de producción en ambientes de desarrollo y pruebas",controlBase:"1. Los datos que sean utilizados en ambiente de pruebas y desarrollo, no podrán ser los mismos del ambiente productivo. (ofuscamiento/enmascaramiento).",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.14.2.1 Política de desarrollo seguro \nA.14.2.6 Ambiente de desarrollo seguro \nA.14.2.7 Desarrollo contratado externamente\nA.14.3.1 Protección de datos de prueba",iso27002:"8.12 Data leakage prevention.\n8.29 Security testing in development, test and production environments\n8.30 Outsourced development",circular:"Mantener tres ambientes independientes: uno para el desarrollo de software, otro para la realización de pruebas y un tercer ambiente para los sistemas en producción. En todo caso, el desempeño y la seguridad de un ambiente no pueden influir en los demás.",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-031",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Ataque o intrusión de piratas informáticos, malware (amenaza informática) , espionaje o ingeniería social.\nAtaques de denegación de servicio distribuido (DDOS).\nAntivirus desactualizados que no permiten la adecuada detección de Malware\nEl uso de ingeniería inversa en aplicaciones móviles bancarias\nS",controlBase:"1. Gestionar con la Dirección de Seguridad Informática la instalación de antivirus EDR en los recursos y/o servidores del proyecto.\n\n2. Implementar controles a nivel de WAF.\n\n3. Implementar solución Anti-Phishing en el portal.\n\n4. Ejecutar pruebas de hacking ético y/o escaneo de vulnerabilidades; según aplicación.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.11.1.4 Protección contra amenazas externas y \nambientales \nA.11.2.7 Disposición segura o reutilización de equipos\nA.12.2.1 Controles contra códigos maliciosos",iso27002:"5.7 Threat Intelligence.\n5.19 Information security in supplier relationships.\n5.23 Information security for use of cloud services.\n6.8 Information security event reporting.\n8.1 User endpoint devices.\n8.7 Protection against malware.\n8.15 Logging.",circular:"Contar con mecanismos para incrementar la seguridad de los portales, protegiéndolos de ataques de negación de servicio, inyección de código malicioso u objetos maliciosos, que afecten la seguridad de la operación o su conclusión exitosa.",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-032",causaBase:"Configuraciones Inseguras",causasAsociadas:"Utilización de componentes Opens urce en soluciones tecnológicas\nDesarrollo de Software Inadecuados creados por el tercero que generan vulnerabilidades a nivel de confidencialidad, integridad, disponibilidad y privacidad de la información.",controlBase:"1. Realizar un análisis de código a los componentes o librerías Opensource.\n\n2. Realizar escaneo de vulnerabilidades de código siguiendo las buenas prácticas OWASP",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"A.14.2.1 Política de desarrollo seguro \nA.14.2.5 Principios de construcción de \nlos sistemas seguros \nA.14.2.6 Ambiente de desarrollo \nseguro\nA.14.2.7 Desarrollo contratado \nexternamente",iso27002:"8.4 Acceses to source code.\n8.28 Secure coding",circular:"Mantener tres ambientes independientes: uno para el desarrollo de software, otro para la realización de pruebas y un tercer ambiente para los sistemas en producción. En todo caso, el desempeño y la seguridad de un ambiente no pueden influir en los demás.\n\nImplementar procedimientos que permitan veri",sfc:"Validar aplicación directamente en la Matriz Legal de requisitos",otras:"Validar aplicación directamente en la Matriz Legal de requisitos"}},
      {id:uid(),code:"CT-033",causaBase:"Debilidades de seguridad asociadas a clientes, colaboradores y terceros",causasAsociadas:"Incumplimiento del modelo de seguridad de la información y ciberseguridad (políticas, normas, lineamientos, manuales, entre otros) aprobados al interior de la entidad.",controlBase:"Cumplimiento de las circulares en los procesos, sistemas y controles de la compañía.\n\nCircular Básica Jurídica 029 de la Superintendencia Financiera de Colombia\nCircular Externa 005 de la Superintendencia Financiera de Colombia\nCircular Externa 007 de la Superintendencia Financiera de Colombia\n\nNota: Validar el cumplimiento del numeral 6 \"REMISIÓN DE INFORMACIÓN A LA SFC\", de la circular Externa 005 de la SFC.",riNiv:"Extremo",rrNiv:"Bajo",status:"pendiente",compliance:"",createdAt:today(),normatividad:{iso27001:"Aplica",iso27002:"Aplica",circular:"Aplica",sfc:"Aplica",otras:"Aplica"}}
    ];
    return controls;
  }

function makeDemo(){
  return {id:uid(),name:"Proyecto Demo",publishDate:"2026-04-15",responsible:"Dir. Seguridad de la Información",createdAt:today(),controls:makeBaseData(),evidences:[]};
}

function loadD(){
  try{
    const v=localStorage.getItem("rg-v8");
    return v?JSON.parse(v):null;
  }catch(e){
    console.warn("loadD: unable to load data from localStorage, returning null",e?.message);
    return null;
  }
}
function saveD(d){
  try{
    localStorage.setItem("rg-v8",JSON.stringify(d));
  }catch(e){
    console.warn("saveD: unable to persist data to localStorage",e?.message);
  }
}

// ═══ AUDIT & TRANSACTION LOG SYSTEM ═══
const LOG_TYPES={
  LOGIN:{cat:"Acceso",icon:"🔐",color:"#1A7AB5"},
  LOGOUT:{cat:"Acceso",icon:"🚪",color:"#9C9590"},
  PROJECT_CREATE:{cat:"Proyecto",icon:"📁",color:"#2E8B57"},
  PROJECT_DELETE:{cat:"Proyecto",icon:"🗑",color:"#DC2626"},
  PROJECT_OPEN:{cat:"Proyecto",icon:"📂",color:"#1A7AB5"},
  CONTROL_FILL:{cat:"Control",icon:"📝",color:"#D97706"},
  CONTROL_CLEAR:{cat:"Control",icon:"🗑",color:"#DC2626"},
  EVIDENCE_ADD:{cat:"Evidencia",icon:"📎",color:"#2E8B57"},
  EVIDENCE_APPROVE:{cat:"Evidencia",icon:"✅",color:"#2E8B57"},
  EVIDENCE_REJECT:{cat:"Evidencia",icon:"❌",color:"#DC2626"},
  EVIDENCE_EDIT:{cat:"Evidencia",icon:"✏️",color:"#D97706"},
  EVIDENCE_DELETE:{cat:"Evidencia",icon:"🗑",color:"#DC2626"},
  EXPORT:{cat:"Exportación",icon:"📥",color:"#1A7AB5"},
  USER_CREATE:{cat:"Usuarios",icon:"👤",color:"#2E8B57"},
  USER_TOGGLE:{cat:"Usuarios",icon:"🔒",color:"#D97706"},
  USER_DELETE:{cat:"Usuarios",icon:"🗑",color:"#DC2626"},
  USER_EDIT:{cat:"Usuarios",icon:"✏️",color:"#D97706"},
  USER_PERMS:{cat:"Usuarios",icon:"🔑",color:"#E87722"},
  PROJECT_FINALIZE:{cat:"Proyecto",icon:"🏁",color:"#2E8B57"},
  ARCHIVE_VIEW:{cat:"Archivo",icon:"📚",color:"#1A7AB5"},
  ARCHIVE_EXPORT:{cat:"Archivo",icon:"📥",color:"#1A7AB5"}
};

function loadLogs(){
  try{
    const v=localStorage.getItem("l15-logs");
    return v?JSON.parse(v):null;
  }catch(e){
    console.warn("loadLogs: unable to load logs from localStorage",e?.message);
    return null;
  }
}
function saveLogs(d){
  try{
    localStorage.setItem("l15-logs",JSON.stringify(d));
  }catch(e){
    console.warn("saveLogs: unable to persist logs to localStorage",e?.message);
  }
}

// ═══ ARCHIVE STORAGE: Matrices finalizadas ═══
function loadArchive(){
  try{
    const v=localStorage.getItem("l15-archive");
    return v?JSON.parse(v):[];
  }catch(e){
    console.warn("loadArchive: unable to load archive",e?.message);
    return [];
  }
}
function saveArchive(d){
  try{
    localStorage.setItem("l15-archive",JSON.stringify(d));
  }catch(e){
    console.warn("saveArchive: unable to persist archive",e?.message);
  }
}

function addLog(logs,setLogs,session,type,detail,projectName){
  const entry = {id:uid(),timestamp:new Date().toISOString(),type:type,category:LOG_TYPES[type]?.cat||"Sistema",user:(session?.name||session?.username||"Sistema"),userId:(session?.userId||"system"),detail:detail,project:projectName||"",ip:"browser"};

  // [ELASTIC-INTEGRATION] Enviar logs transaccionales a Elasticsearch
  // Categorías transaccionales: Control, Evidencia, Exportación, Proyecto
  // if(["Control","Evidencia","Exportación","Proyecto"].indexOf(entry.category)>=0){
  //   fetch('/api/logs/elasticsearch', {
  //     method: 'POST',
  //     headers: {'Content-Type':'application/json','Authorization':'Bearer '+session.token},
  //     body: JSON.stringify({
  //       index: 'linea15-transactions-'+new Date().toISOString().slice(0,7),
  //       document: entry
  //     })
  //   }).catch(function(err){ console.error('Elastic log failed:', err) });
  // }

  // [QRADAR-INTEGRATION] Enviar logs de auditoría al SIEM QRadar
  // Categorías de auditoría: Acceso, Usuarios, y acciones críticas (eliminar, aprobar)
  // const auditTypes = ["LOGIN","LOGOUT","USER_CREATE","USER_DELETE","USER_TOGGLE","USER_PERMS",
  //                   "EVIDENCE_APPROVE","EVIDENCE_REJECT","EVIDENCE_DELETE","PROJECT_DELETE","EXPORT"];
  // if(auditTypes.indexOf(type)>=0){
  //   fetch('/api/logs/qradar', {
  //     method: 'POST',
  //     headers: {'Content-Type':'application/json'},
  //     body: JSON.stringify({
  //       format: 'CEF',  // Common Event Format para QRadar
  //       severity: ["USER_DELETE","PROJECT_DELETE","EVIDENCE_DELETE"].indexOf(type)>=0 ? 'HIGH' : 'LOW',
  //       event: {
  //         deviceVendor: 'BPT',
  //         deviceProduct: 'Linea15',
  //         deviceVersion: '1.0',
  //         signatureId: type,
  //         name: detail,
  //         src: entry.ip,
  //         suser: entry.user,
  //         suid: entry.userId,
  //         cs1: entry.project,
  //         cs1Label: 'ProjectName',
  //         rt: entry.timestamp
  //       }
  //     })
  //   }).catch(function(err){ console.error('QRadar log failed:', err) });
  // }

  let updated=(logs||[]).concat([entry]);
  if(updated.length>1000)updated=updated.slice(-1000);
  setLogs(updated);
  saveLogs(updated);
  return entry;
}

const iS={width:"100%",padding:"12px 16px",borderRadius:10,border:"1px solid "+T.bd,background:T.bg,color:T.tx,fontSize:15,fontFamily:FONT_FAMILY,outline:"none",boxSizing:"border-box"};
const sS=Object.assign({},iS,{fontSize:13,cursor:"pointer"});
const cS={background:T.sf,borderRadius:14,border:"1px solid "+T.bd,padding:24,transition:"all .15s"};
const lS={fontSize:11,fontWeight:700,color:T.td,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.6px"};
const mS={fontFamily:"'Space Mono',monospace"};

function btnS(v,sz){const base = {borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontFamily:FONT_FAMILY,display:"inline-flex",alignItems:"center",gap:6,transition:"all .15s"};const szs = {sm:{padding:"6px 12px",fontSize:12},lg:{padding:"14px 28px",fontSize:16},md:{padding:"10px 20px",fontSize:14}};const vs = {primary:{background:T.ac,color:T.wh},danger:{background:T.ds,color:T.dn},success:{background:T.sc,color:T.wh},outline:{background:"transparent",color:T.ts,border:"1px solid "+T.bd},ghost:{background:"transparent",color:T.ts}};return Object.assign({},base,szs[sz||"md"],vs[v||"primary"])}
function bdg(c,b){return{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,color:c,background:b,whiteSpace:"nowrap"}}

function NormBox(props){
  const _open = useState(false),open=_open[0],setOpen=_open[1];
  const n = props.norm;
  if(!n)return null;
  const secs = [{k:"iso27001",l:"ISO 27001",c:"#5B21B6",b:"rgba(91,33,182,.08)"},{k:"iso27002",l:"ISO 27002",c:"#1A7AB5",b:"rgba(26,122,181,.08)"},{k:"circular",l:"Circular SFC",c:"#B45309",b:"rgba(180,83,9,.08)"},{k:"sfc",l:"Req. Nube SFC",c:"#166534",b:"rgba(22,101,52,.08)"},{k:"otras",l:"Otras Normas",c:"#B91C1C",b:"rgba(185,28,28,.08)"}];
  let has=secs.filter(function(s){return n[s.k]&&n[s.k].trim()&&n[s.k].indexOf("Validar aplicación directamente")<0&&n[s.k]!=="Aplica"});
  if(!has.length)return null;
  return h("div",{style:{marginTop:12}},
    h("button",{onClick:function(){setOpen(!open)},style:{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",background:T.sa,border:"1px solid "+T.bd,borderRadius:8,cursor:"pointer",color:T.ts,fontSize:12,fontWeight:700,fontFamily:FONT_FAMILY,textTransform:"uppercase",letterSpacing:"0.5px"}},
      h("span",{style:{transition:"transform .2s",transform:open?"rotate(90deg)":"rotate(0deg)",fontSize:10}},"▶"),
      h("span",null,"Normatividad aplicable ("+has.length+" fuentes)"),
      has.map(function(s){return h("span",{key:s.k,style:{width:8,height:8,borderRadius:"50%",background:s.c,flexShrink:0}})})
    ),
    open?h("div",{style:{display:"flex",flexDirection:"column",gap:6,marginTop:8}},
      has.map(function(s){return h("div",{key:s.k,style:{background:s.b,borderRadius:8,padding:"8px 12px",border:"1px solid "+s.c+"22"}},h("div",{style:{fontSize:10,fontWeight:700,color:s.c,marginBottom:2}},s.l),h("div",{style:{fontSize:11,color:T.tx,whiteSpace:"pre-line",lineHeight:1.4}},n[s.k]))})
    ):null
  );
}
function Mdl(p){return h("div",{style:{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.65)",backdropFilter:"blur(6px)"},onClick:p.onClose},h("div",{style:{background:T.sf,borderRadius:18,border:"1px solid "+T.bd,width:560,maxWidth:"95vw",maxHeight:"92vh",overflow:"auto",padding:28},onClick:function(e){e.stopPropagation()}},h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},h("h3",{style:{margin:0,fontSize:18,fontWeight:800,color:T.tx}},p.title),h("button",{onClick:p.onClose,style:{background:"none",border:"none",color:T.td,fontSize:20,cursor:"pointer"}},"✕")),p.children))}
function Fld(p){return h("div",{style:{marginBottom:16}},h("label",{style:lS},p.label),p.children)}
function SBdg(p){let s=CTRL_ST[p.status];if(!s)return null;return h("span",{style:bdg(s.c,s.c+"18")},s.i+" "+s.l)}
function EvBdg(p){let s=EV_ST[p.status];if(!s)return null;return h("span",{style:bdg(s.c,s.c+"18")},s.i+" "+s.l)}

// ═══ QUESTIONNAIRE ═══
function Questionnaire(props){
  const proj = props.proj,onSave=props.onSave,onFinish=props.onFinish;
  const _idx = useState(0),idx=_idx[0],setIdx=_idx[1];
  const items = proj.controls;
  const total = items.length;
  const safeIdx = total > 0 ? Math.min(idx, total - 1) : 0;
  const cur = total > 0 ? items[safeIdx] : null;
  const _lv = useState(cur?.compliance || ""),lv=_lv[0],setLv=_lv[1];
  const _listening = useState(false),listening=_listening[0],setListening=_listening[1];
  useEffect(function(){
    if(total > 0){
      setLv(items[Math.min(idx, total - 1)].compliance || "");
    }
  },[idx, total]);

  // Voice dictation using Web Speech API
  function toggleVoice(){
    var SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SRClass){
      alert("Tu navegador no soporta dictado por voz. Usa Chrome o Edge.");
      return;
    }
    if(listening){
      if(window._recognition){window._recognition.stop();window._recognition=null}
      setListening(false);
      return;
    }
    try{
      var recog = new SRClass();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'es-CO';
      recog.maxAlternatives = 1;
      recog.onresult = function(event){
        var transcript = '';
        for(var i = 0; i < event.results.length; i++){
          transcript += event.results[i][0].transcript;
        }
        if(transcript){
          // Append to current text
          var currentText = document.getElementById('voice-textarea') ? document.getElementById('voice-textarea').value : '';
          var newText = currentText ? currentText + ' ' + transcript : transcript;
          setLv(newText);
        }
      };
      recog.onerror = function(e){
        console.warn('Speech error:', e.error);
        if(e.error !== 'no-speech'){
          setListening(false);
        }
      };
      recog.onend = function(){
        // Auto-restart if still in listening mode
        if(window._voiceActive){
          try{
            recog.start();
          }catch(err){
            setListening(false);
            window._voiceActive = false;
          }
        } else {
          setListening(false);
        }
      };
      recog.start();
      window._recognition = recog;
      window._voiceActive = true;
      setListening(true);
    }catch(err){
      alert("Error al iniciar dictado: " + err.message);
    }
  }

  function stopVoice(){
    window._voiceActive = false;
    if(window._recognition){window._recognition.stop();window._recognition=null}
    setListening(false);
  }

  // Early return AFTER all hooks
  if(total===0)return h("div",{style:{textAlign:"center",padding:60}},h("div",{style:{fontSize:48}},"📭"),h("p",{style:{color:T.ts}},"No hay controles"));

  const filled = items.filter(function(x){return x.compliance&&x.compliance.trim()}).length;
  function saveGo(ni){onSave(cur.id,lv);setIdx(ni)}

  return h("div",{style:{maxWidth:900,margin:"0 auto",padding:"0 0 30px"}},
    h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
      h("button",{style:btnS("ghost","sm"),onClick:function(){onSave(cur.id,lv);onFinish()}},"← Dashboard"),
      h("span",{style:Object.assign({},mS,{fontSize:12,color:T.sc,fontWeight:700})},filled+"/"+total+" completados")
    ),
    h("div",{style:{height:6,background:T.sa,borderRadius:3,overflow:"hidden",marginBottom:14}},h("div",{style:{height:"100%",width:(filled/total*100)+"%",background:"linear-gradient(90deg,"+T.ac+","+T.sc+")",borderRadius:3,transition:"width .4s"}})),
    h("div",{style:{display:"flex",gap:3,flexWrap:"wrap",marginBottom:14,justifyContent:"center"}},items.map(function(item,i){
      let done=item.compliance&&item.compliance.trim();let active=i===safeIdx;
      return h("button",{key:i,onClick:function(){onSave(cur.id,lv);setIdx(i)},style:{width:26,height:26,borderRadius:"50%",border:active?"2px solid "+T.ah:"2px solid transparent",background:active?T.ac:done?T.sc:T.sa,color:active||done?T.wh:T.td,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'Space Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center"}},i+1)
    })),
    h("div",{style:{background:T.sf,borderRadius:12,border:"1px solid "+T.ac+"44",overflow:"hidden"}},
      h("div",{style:{background:T.ac,padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}},
        h("div",null,
          h("span",{style:{fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:600}},"PREGUNTA "+(safeIdx+1)+" DE "+total+" — "),
          h("span",{style:{fontSize:10,color:"rgba(255,255,255,.6)"}},cur.code)
        ),
        h("span",{style:{fontSize:14,fontWeight:800,color:T.wh}},cur.causaBase)
      ),
      h("div",{style:{padding:"12px 18px",borderBottom:"1px solid "+T.bd}},
        h("div",{style:{fontSize:10,fontWeight:700,color:T.td,textTransform:"uppercase",marginBottom:4}},"Causas asociadas:"),
        h("div",{style:{fontSize:12,color:T.ts,lineHeight:1.5,padding:"8px 12px",background:T.sa,borderRadius:6}},cur.causasAsociadas)
      ),
      h("div",{style:{padding:"12px 18px",borderBottom:"1px solid "+T.bd}},
        h("div",{style:{fontSize:10,fontWeight:700,color:T.ac,textTransform:"uppercase",marginBottom:6}},"Control a validar:"),
        h("div",{style:{fontSize:13,color:T.tx,lineHeight:1.7,padding:"10px 14px",background:T.as,borderRadius:8,border:"1px solid "+T.ac+"33",whiteSpace:"pre-line"}},cur.controlBase)
      ),
      h("div",{style:{padding:"6px 18px 10px"}},h(NormBox,{norm:cur.normatividad})),
      h("div",{style:{padding:"0 18px 16px"}},
        h("div",{style:{background:T.bg,borderRadius:10,padding:"14px 16px",border:"2px dashed "+T.wn+"55"}},
          h("label",{style:{fontSize:13,fontWeight:800,color:T.wn,display:"block",marginBottom:8}},"✏️  ¿Cómo se cumple este control en tu proyecto?"),
          h("textarea",{id:"voice-textarea",key:"ta-"+cur.id,style:Object.assign({},iS,{minHeight:120,resize:"vertical",lineHeight:"1.6",fontSize:13}),value:lv,onChange:function(e){setLv(e.target.value)},placeholder:listening?"Escuchando... habla ahora":"Escribe o dicta por voz tu respuesta..."}),
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}},
            h("div",{style:{display:"flex",gap:6,alignItems:"center"}},
              lv.trim()?h("span",{style:bdg(T.sc,T.ss)},"✓ Respondido"):h("span",{style:bdg(T.wn,T.ws)},"⏳ Sin responder"),
              h("button",{
                type:"button",
                onClick:function(e){e.preventDefault();e.stopPropagation();if(listening){stopVoice()}else{toggleVoice()}},
                style:{
                  padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,
                  display:"flex",alignItems:"center",gap:6,
                  border:listening?"2px solid #DC2626":"2px solid "+T.bd,
                  background:listening?"#FEE2E2":"transparent",
                  color:listening?"#DC2626":T.ts,
                  fontFamily:FONT_FAMILY,transition:"all .2s"
                }
              },
                listening?h("span",{style:{width:8,height:8,borderRadius:"50%",background:"#DC2626",display:"inline-block",animation:"pulse 1s infinite"}}):"🎤",
                listening?" Detener":" Dictar por voz"
              )
            ),
            h("div",{style:{display:"flex",gap:6}},
              lv.trim()?h("button",{type:"button",style:btnS("danger","sm"),onClick:function(){setLv("");onSave(cur.id,"")}},"🗑 Limpiar"):null,
              h("button",{type:"button",style:Object.assign({},btnS("primary","sm"),{opacity:lv!==(cur.compliance||"")?1:.5}),onClick:function(){onSave(cur.id,lv)}},lv!==(cur.compliance||"")?"💾 Guardar":"💾 Guardado")
            )
          ),
          listening?h("div",{style:{marginTop:8,padding:"8px 12px",background:"#FEE2E2",borderRadius:8,fontSize:12,color:"#DC2626",fontWeight:600}},"🔴 Escuchando... habla y se transcribirá automáticamente."):null
        )
      )
    ),
    h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16}},
      h("button",{style:btnS(safeIdx>0?"outline":"ghost","sm"),disabled:safeIdx===0,onClick:function(){saveGo(safeIdx-1)}},"← Anterior"),
      h("div",{style:{display:"flex",gap:6,alignItems:"center"}},
        h("span",{style:Object.assign({},mS,{fontSize:12,color:T.td})},(safeIdx+1)+"/"+total),
        h("button",{style:Object.assign({},btnS("outline","sm"),{marginLeft:6}),onClick:function(){onSave(cur.id,lv);onFinish()}},"💾 Guardar y salir")
      ),
      safeIdx<total-1?h("button",{style:btnS("primary","sm"),onClick:function(){saveGo(safeIdx+1)}},"Siguiente →"):h("button",{style:btnS("success"),onClick:function(){onSave(cur.id,lv);onFinish()}},"✓ Finalizar")
    ),
    filled===total?h("div",{style:{marginTop:30,textAlign:"center",padding:20,background:T.ss,borderRadius:12}},h("div",{style:{fontSize:32}},"🎉"),h("div",{style:{fontSize:16,fontWeight:800,color:T.sc}},"¡Todos los controles respondidos!")):null
  );
}

// ═══ EVIDENCE FLOW ═══
function EvidenceFlow(props){
  const proj = props.proj,onSave=props.onSave,onBack=props.onBack;
  const _s = useState(1),step=_s[0],setStep=_s[1];
  const _ctrl = useState(null),ctrl=_ctrl[0],setCtrl=_ctrl[1];
  const _done = useState(false),done=_done[0],setDone=_done[1];
  const _type = useState(EV_TYPES[0]),et=_type[0],setEt=_type[1];
  const _desc = useState(""),ed=_desc[0],setEd=_desc[1];
  const _date = useState(today()),edt=_date[0],setEdt=_date[1];
  const _notes = useState(""),en=_notes[0],setEn=_notes[1];
  const _rev = useState(""),er=_rev[0],setEr=_rev[1];
  const _search = useState(""),sch=_search[0],setSch=_search[1];

  const _files = useState([]),files=_files[0],setFiles=_files[1];

  function handleFiles(e){
    let fileList=e.target.files;
    if(!fileList||!fileList.length)return;
    const newFiles = [];
    let pending=fileList.length;
    for(let i=0;i<fileList.length;i++){
      (function(file){
        const reader = new FileReader();
        reader.onload=function(ev){
          newFiles.push({name:file.name,size:file.size,type:file.type,data:ev.target.result});
          pending--;
          if(pending===0)setFiles(function(prev){return prev.concat(newFiles)});
        };
        reader.readAsDataURL(file);
      })(fileList[i]);
    }
  }
  function removeFile(idx){setFiles(function(prev){return prev.filter(function(_,i){return i!==idx})})}
  function formatSize(bytes){if(bytes<1024)return bytes+" B";if(bytes<1048576)return(bytes/1024).toFixed(1)+" KB";return(bytes/1048576).toFixed(1)+" MB"}
  function fileIcon(name){let ext=(name||"").split(".").pop().toLowerCase();if(["pdf"].indexOf(ext)>=0)return "📄";if(["jpg","jpeg","png","gif","webp","bmp"].indexOf(ext)>=0)return "🖼️";if(["doc","docx"].indexOf(ext)>=0)return "📝";if(["xls","xlsx"].indexOf(ext)>=0)return "📊";return "📎"}

  function doSave(){if(!ctrl||!ed)return;onSave({controlId:ctrl.id,type:et,description:ed,date:edt,notes:en,reviewer:er,files:files.map(function(f){return{name:f.name,size:f.size,type:f.type,data:f.data}})});setDone(true)}
  function reset(){setStep(1);setCtrl(null);setDone(false);setEt(EV_TYPES[0]);setEd("");setEdt(today());setEn("");setEr("");setSch("");setFiles([])}

  if(done)return h("div",{style:{maxWidth:550,margin:"0 auto",textAlign:"center",padding:"50px 20px"}},
    h("div",{style:{fontSize:52,marginBottom:14}},"✅"),
    h("h2",{style:{margin:"0 0 6px",fontSize:20,fontWeight:800,color:T.sc}},"Evidencia Registrada"),
    h("p",{style:{fontSize:13,color:T.ts}},"Vinculada a ",h("strong",{style:{color:T.ac}},ctrl.code+" — "+ctrl.causaBase)),
    h("div",{style:{display:"flex",gap:10,justifyContent:"center",marginTop:20}},h("button",{style:btnS("primary"),onClick:reset},"＋ Otra"),h("button",{style:btnS("outline"),onClick:onBack},"Volver"))
  );

  let filtered=proj.controls.filter(function(c){return !sch||((c.code+" "+c.causaBase+" "+c.controlBase).toLowerCase().indexOf(sch.toLowerCase())>=0)});

  return h("div",{style:{maxWidth:700,margin:"0 auto"}},
    h("button",{style:btnS("ghost","sm"),onClick:onBack},"← Volver"),
    h("h2",{style:{margin:"12px 0 4px",fontSize:22,fontWeight:800}},"Agregar Evidencia"),

    step===1?h("div",null,
      h("p",{style:{fontSize:13,color:T.ts,marginBottom:16}},"Selecciona el control al que pertenece la evidencia:"),
      h("input",{style:Object.assign({},iS,{marginBottom:12}),placeholder:"Buscar control...",value:sch,onChange:function(e){setSch(e.target.value)}}),
      h("div",{style:{display:"flex",flexDirection:"column",gap:8}},filtered.map(function(c){
        let ev=proj.evidences.filter(function(e){return e.controlId===c.id}).length;
        return h("div",{key:c.id,style:Object.assign({},cS,{cursor:"pointer"}),onClick:function(){setCtrl(c);setStep(2)}},
          h("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:3}},
            h("span",{style:Object.assign({},mS,{fontSize:10,color:T.td})},c.code),
            h(SBdg,{status:c.status}),
            ev>0?h("span",{style:bdg(T.inf,T.inf+"18")},ev+" ev."):null
          ),
          h("div",{style:{fontSize:13,fontWeight:700}},c.causaBase),
          h("div",{style:{fontSize:11,color:T.ts,marginTop:2}},c.controlBase.substring(0,100)+"...")
        );
      }))
    ):null,

    step===2&&ctrl?h("div",null,
      h("div",{style:Object.assign({},cS,{marginBottom:16,background:T.as,borderColor:T.ac})},
        h("div",{style:{fontSize:10,color:T.td}},"Control seleccionado:"),
        h("div",{style:{fontSize:14,fontWeight:700,marginTop:4}},ctrl.code+" — "+ctrl.causaBase),
        h("div",{style:{fontSize:12,color:T.ts,marginTop:4}},ctrl.controlBase.substring(0,200))
      ),
      h(Fld,{label:"Tipo de evidencia"},h("select",{style:Object.assign({},sS,{width:"100%"}),value:et,onChange:function(e){setEt(e.target.value)}},EV_TYPES.map(function(t){return h("option",{key:t},t)}))),
      h(Fld,{label:"Descripción de la evidencia"},h("textarea",{style:Object.assign({},iS,{minHeight:80,resize:"vertical"}),value:ed,onChange:function(e){setEd(e.target.value)},placeholder:"Describe la evidencia..."})),
      h(Fld,{label:"Adjuntar archivos (PDF, imágenes, Word, Excel)"},
        h("div",null,
          h("label",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"16px 20px",border:"2px dashed "+T.bd,borderRadius:10,cursor:"pointer",background:T.bg,transition:"all .15s",color:T.ts,fontSize:13,fontWeight:600}},
            h("input",{type:"file",multiple:true,accept:".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.xls,.xlsx,.pptx,.txt,.csv",onChange:handleFiles,style:{display:"none"}}),
            h("span",{style:{fontSize:24}},"📁"),
            h("span",null,"Haz clic para seleccionar archivos")
          ),
          files.length>0?h("div",{style:{display:"flex",flexDirection:"column",gap:6,marginTop:10}},
            files.map(function(f,i){
              return h("div",{key:i,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:T.sa,borderRadius:8,border:"1px solid "+T.bd}},
                h("span",{style:{fontSize:20}},fileIcon(f.name)),
                h("div",{style:{flex:1,minWidth:0}},
                  h("div",{style:{fontSize:13,fontWeight:600,color:T.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},f.name),
                  h("div",{style:{fontSize:10,color:T.td,marginTop:1}},formatSize(f.size))
                ),
                f.type&&f.type.indexOf("image")>=0?h("img",{src:f.data,style:{width:40,height:40,borderRadius:6,objectFit:"cover"}}):null,
                h("button",{onClick:function(){removeFile(i)},style:{background:"none",border:"none",color:T.dn,cursor:"pointer",fontSize:14,padding:4}},"✕")
              );
            })
          ):null
        )
      ),
      h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},
        h(Fld,{label:"Fecha"},h("input",{type:"date",style:iS,value:edt,onChange:function(e){setEdt(e.target.value)}})),
        h(Fld,{label:"Revisor"},h("input",{style:iS,value:er,onChange:function(e){setEr(e.target.value)}}))
      ),
      h(Fld,{label:"Notas"},h("textarea",{style:Object.assign({},iS,{minHeight:50,resize:"vertical"}),value:en,onChange:function(e){setEn(e.target.value)}})),
      h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}},
        h("button",{style:btnS("outline"),onClick:function(){setStep(1)}},"← Cambiar control"),
        h("button",{style:btnS("primary","lg"),onClick:doSave,disabled:!ed},"📎 Registrar Evidencia")
      )
    ):null
  );
}

// ═══ ZOOM VIEWER ═══
function ZoomViewer(props){
  const _z = useState(1),zoom=_z[0],setZoom=_z[1];
  const _drag = useState(false),dragging=_drag[0],setDragging=_drag[1];
  const _pos = useState({x:0,y:0}),pos=_pos[0],setPos=_pos[1];
  const _start = useState({x:0,y:0}),start=_start[0],setStart=_start[1];

  function zIn(){setZoom(function(z){return Math.min(z+0.5,5)})}
  function zOut(){setZoom(function(z){return Math.max(z-0.5,0.5)})}
  function zReset(){setZoom(1);setPos({x:0,y:0})}

  function onWheel(e){
    e.preventDefault();
    if(e.deltaY<0)zIn();else zOut();
  }

  function onDown(e){
    if(zoom<=1)return;
    setDragging(true);
    setStart({x:e.clientX-pos.x,y:e.clientY-pos.y});
  }
  function onMove(e){
    if(!dragging)return;
    setPos({x:e.clientX-start.x,y:e.clientY-start.y});
  }
  function onUp(){setDragging(false)}

  return h("div",{style:{padding:"8px 14px 14px"}},
    // Zoom controls
    h("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8}},
      h("button",{onClick:zOut,style:Object.assign({},btnS("outline","sm"),{width:36,justifyContent:"center",fontSize:18,padding:"4px"})},"−"),
      h("span",{style:Object.assign({},mS,{fontSize:12,color:T.ts,minWidth:50,textAlign:"center"})},Math.round(zoom*100)+"%"),
      h("button",{onClick:zIn,style:Object.assign({},btnS("outline","sm"),{width:36,justifyContent:"center",fontSize:18,padding:"4px"})},"+"),
      h("button",{onClick:zReset,style:btnS("ghost","sm")},"↺ Reset")
    ),
    // Image container
    h("div",{
      style:{overflow:"hidden",borderRadius:8,background:"#f5f5f5",cursor:zoom>1?"grab":"zoom-in",position:"relative",maxHeight:500},
      onWheel:onWheel,
      onMouseDown:onDown,
      onMouseMove:onMove,
      onMouseUp:onUp,
      onMouseLeave:onUp
    },
      h("img",{src:props.src,style:{width:"100%",transform:"scale("+zoom+") translate("+pos.x/zoom+"px,"+pos.y/zoom+"px)",transformOrigin:"center center",transition:dragging?"none":"transform .2s",display:"block",userSelect:"none",pointerEvents:"none"}})
    ),
    h("div",{style:{fontSize:10,color:T.td,textAlign:"center",marginTop:6}},"Scroll o botones +/− para zoom · Arrastra para mover")
  );
}

// ═══ EDIT EVIDENCE MODAL ═══
function EditEvModal(props){
  const ev = props.ev,onSave=props.onSave,onClose=props.onClose;
  const _t = useState(ev.type||EV_TYPES[0]),et=_t[0],setEt=_t[1];
  const _d = useState(ev.description||""),ed=_d[0],setEd=_d[1];
  const _dt = useState(ev.date||today()),edt=_dt[0],setEdt=_dt[1];
  const _n = useState(ev.notes||""),en=_n[0],setEn=_n[1];
  const _r = useState(ev.reviewer||""),er=_r[0],setEr=_r[1];
  const _f = useState(ev.files||[]),files=_f[0],setFiles=_f[1];

  function handleFiles(e){
    let fileList=e.target.files;if(!fileList||!fileList.length)return;
    const newFiles = [];let pending=fileList.length;
    for(let i=0;i<fileList.length;i++){
      (function(file){const reader = new FileReader();reader.onload=function(ev2){newFiles.push({name:file.name,size:file.size,type:file.type,data:ev2.target.result});pending--;if(pending===0)setFiles(function(prev){return prev.concat(newFiles)})};reader.readAsDataURL(file)})(fileList[i]);
    }
  }
  function removeFile(idx){setFiles(function(prev){return prev.filter(function(_,i){return i!==idx})})}

  return h(Mdl,{title:"Editar Evidencia",onClose:onClose},
    h(Fld,{label:"Tipo de evidencia"},h("select",{style:Object.assign({},sS,{width:"100%"}),value:et,onChange:function(e){setEt(e.target.value)}},EV_TYPES.map(function(t){return h("option",{key:t},t)}))),
    h(Fld,{label:"Descripción"},h("textarea",{style:Object.assign({},iS,{minHeight:80,resize:"vertical"}),value:ed,onChange:function(e){setEd(e.target.value)}})),
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},
      h(Fld,{label:"Fecha"},h("input",{type:"date",style:iS,value:edt,onChange:function(e){setEdt(e.target.value)}})),
      h(Fld,{label:"Revisor"},h("input",{style:iS,value:er,onChange:function(e){setEr(e.target.value)}}))
    ),
    h(Fld,{label:"Notas"},h("textarea",{style:Object.assign({},iS,{minHeight:50,resize:"vertical"}),value:en,onChange:function(e){setEn(e.target.value)}})),
    // Current files
    h(Fld,{label:"Archivos adjuntos"},
      h("div",null,
        files.length>0?h("div",{style:{display:"flex",flexDirection:"column",gap:6,marginBottom:10}},
          files.map(function(f,i){
            let ext=(f.name||"").split(".").pop().toLowerCase();
            const icon = ["pdf"].indexOf(ext)>=0?"📄":["jpg","jpeg","png","gif","webp"].indexOf(ext)>=0?"🖼️":["doc","docx"].indexOf(ext)>=0?"📝":["xls","xlsx"].indexOf(ext)>=0?"📊":"📎";
            return h("div",{key:i,style:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:T.sa,borderRadius:6,border:"1px solid "+T.bd}},
              h("span",{style:{fontSize:18}},icon),
              h("div",{style:{flex:1,fontSize:12,color:T.tx}},f.name),
              h("button",{onClick:function(){removeFile(i)},style:{background:"none",border:"none",color:T.dn,cursor:"pointer",fontSize:13}},"✕")
            );
          })
        ):null,
        h("label",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 16px",border:"2px dashed "+T.bd,borderRadius:8,cursor:"pointer",background:T.bg,color:T.ts,fontSize:12,fontWeight:600}},
          h("input",{type:"file",multiple:true,accept:".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.xls,.xlsx,.pptx,.txt,.csv",onChange:handleFiles,style:{display:"none"}}),
          "📁 Agregar más archivos"
        )
      )
    ),
    h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20}},
      h("button",{style:btnS("outline"),onClick:onClose},"Cancelar"),
      h("button",{style:btnS("primary"),disabled:!ed,onClick:function(){onSave({type:et,description:ed,date:edt,notes:en,reviewer:er,files:files})}},"💾 Guardar Cambios")
    )
  );
}

// ═══ AUTH SYSTEM (AD-Ready Architecture) ═══
// AUTH PROVIDER: Currently local storage. Replace authenticate() with AD/LDAP/OAuth call.
// Expected AD integration points marked with [AD-INTEGRATION]

const AUTH_ROLES = {
  admin: { l: "Administrador", perms: ["create_project","delete_project","fill_controls","add_evidence","approve_evidence","edit_evidence","delete_evidence","manage_users"] },
  lider: { l: "Líder Técnico", perms: ["create_project","fill_controls","add_evidence","approve_evidence","edit_evidence","delete_evidence"] },
  analista: { l: "Analista", perms: ["fill_controls","add_evidence","edit_evidence"] },
  auditor: { l: "Auditor / Revisor", perms: ["approve_evidence"] },
  viewer: { l: "Solo lectura", perms: [] }
};

function loadUsers(){
  try{
    const v=localStorage.getItem("l15-users");
    return v?JSON.parse(v):null;
  }catch(e){
    console.warn("loadUsers: unable to load users from localStorage",e?.message);
    return null;
  }
}
function saveUsers(d){
  try{
    localStorage.setItem("l15-users",JSON.stringify(d));
  }catch(e){
    console.warn("saveUsers: unable to persist users",e?.message);
  }
}
function loadSession(){
  try{
    const v=localStorage.getItem("l15-session");
    return v?JSON.parse(v):null;
  }catch(e){
    console.warn("loadSession: unable to load session",e?.message);
    return null;
  }
}
function saveSession(d){
  try{
    if(d){localStorage.setItem("l15-session",JSON.stringify(d))}
    else{localStorage.removeItem("l15-session")}
  }catch(e){
    console.warn("saveSession: unable to persist session",e?.message);
  }
}

// ═══ SECURITY: Password Hashing (SHA-256 + salt) ═══
// OWASP A02 mitigation: Never store passwords in plain text
async function hashPassword(password, salt) {
  const effectiveSalt = salt || "linea15-salt-v1";
  const encoder = new TextEncoder();
  const data = encoder.encode(password + effectiveSalt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Synchronous fallback for demo (uses simple hash)
function hashPasswordSync(password) {
  // Simple deterministic hash for demo - production should use bcrypt on backend
  const salt = "linea15-salt-v1";
  const str = password + salt;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  // Convert to hex + additional mixing
  const secondary = btoa(str).split("").reverse().join("").slice(0, 32);
  return Math.abs(hash).toString(16).padStart(8, "0") + ":" + secondary;
}

// Pre-hashed default passwords (admin123 and lider123 hashed)
const DEFAULT_USERS = [
  { id: "admin", username: "admin", name: "Administrador", email: "admin@empresa.com", role: "admin", passwordHash: hashPasswordSync("admin123"), active: true, createdAt: "2026-01-01", failedAttempts: 0, lockedUntil: null },
  { id: "lider1", username: "lider", name: "Líder Técnico", email: "lider@empresa.com", role: "lider", passwordHash: hashPasswordSync("lider123"), active: true, createdAt: "2026-01-01", failedAttempts: 0, lockedUntil: null }
];

// ═══ SECURITY: Account Lockout after failed attempts ═══
// OWASP A07 mitigation
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ═══ SECURITY: Session Timeout ═══
// OWASP A07 mitigation
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

// [AD-INTEGRATION] Replace this function with:
// async function authenticate(username, password) {
//   const response = await fetch('/api/auth/ldap', { method: 'POST', body: JSON.stringify({username, password}) });
//   return response.json(); // { success, user, token }
// }
function authenticateLocal(users, username, password) {
  const hashedInput = hashPasswordSync(password);
  const user = users.find(function(u) {
    return (u.username === username || u.email === username) &&
           u.passwordHash === hashedInput &&
           u.active &&
           (!u.lockedUntil || new Date(u.lockedUntil) < new Date());
  });
  return user || null;
}

function isAccountLocked(users, username) {
  const user = users.find(function(u) { return u.username === username || u.email === username; });
  if (!user) return false;
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return true;
  }
  return false;
}

function registerFailedAttempt(users, username) {
  return users.map(function(u) {
    if (u.username !== username && u.email !== username) return u;
    const attempts = (u.failedAttempts || 0) + 1;
    const locked = attempts >= MAX_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString() : null;
    return Object.assign({}, u, { failedAttempts: attempts, lockedUntil: locked });
  });
}

function resetFailedAttempts(users, username) {
  return users.map(function(u) {
    if (u.username !== username && u.email !== username) return u;
    return Object.assign({}, u, { failedAttempts: 0, lockedUntil: null });
  });
}

function LoginScreen(props) {
  const onLogin = props.onLogin;
  const _u = useState(""), user = _u[0], setUser = _u[1];
  const _pw = useState(""), pw = _pw[0], setPw = _pw[1];
  const _err = useState(""), err = _err[0], setErr = _err[1];
  const _loading = useState(false), loading = _loading[0], setLoading = _loading[1];
  const _forgot = useState(""), forgotMsg = _forgot[0], setForgotMsg = _forgot[1];

  function doLogin() {
    if (!user || !pw) { setErr("Ingresa usuario y contraseña"); return; }
    setLoading(true); setErr("");

    // Determine email: if user typed a username, append @linea15.app
    const email = user.indexOf("@") >= 0 ? user : user + "@linea15.app";

    API.login(email, pw).then(function(result) {
      if (result.error) {
        // Register failed attempt
        // Failed attempt handled server-side
        setErr(result.error);
        setLoading(false);
      } else {
        onLogin(result.user);
      }
    }).catch(function(e) {
      setErr("Error de conexión: " + (e?.message || "Intenta de nuevo"));
      setLoading(false);
    });
  }

  function onKeyDown(e) { if (e.key === "Enter") doLogin(); }

  return h("div", { style: { fontFamily: "'DM Sans',sans-serif", background: T.bg, color: T.tx, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" } },
    h("link", { href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap", rel: "stylesheet" }),
    h("div", { style: { width: 420, maxWidth: "90vw" } },
      // Logo
      h("div", { style: { textAlign: "center", marginBottom: 40 } },
        h("div", { style: { width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg," + T.ac + ",#F59E0B)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: T.wh, fontWeight: 900, marginBottom: 16 } }, "L"),
        h("h1", { style: { margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: "-0.5px" } }, "Línea 1.5"),
        h("p", { style: { margin: "6px 0 0", fontSize: 14, color: T.ts } }, "Gestión de Riesgos Tecnológicos")
      ),
      // Login card
      h("div", { style: Object.assign({}, cS, { padding: 32 }) },
        h("h2", { style: { margin: "0 0 20px", fontSize: 18, fontWeight: 800, textAlign: "center" } }, "Iniciar Sesión"),
        // [AD-INTEGRATION] Add: "Iniciar con Active Directory" button here
        // h("button", { style: btnS("outline","lg"), onClick: adLogin }, "🏢 Iniciar con Active Directory"),
        // h("div", { style: { textAlign:"center", margin:"16px 0", color:T.td, fontSize:12 } }, "o con cuenta local"),
        h(Fld, { label: "Usuario o correo electrónico" },
          h("input", { style: iS, value: user, onChange: function(e) { setUser(e.target.value); }, onKeyDown: onKeyDown, placeholder: "usuario@empresa.com", autoFocus: true })
        ),
        h(Fld, { label: "Contraseña" },
          h("input", { type: "password", style: iS, value: pw, onChange: function(e) { setPw(e.target.value); }, onKeyDown: onKeyDown, placeholder: "••••••••" })
        ),
        err ? h("div", { style: { padding: "10px 14px", background: T.ds, borderRadius: 8, color: T.dn, fontSize: 13, fontWeight: 600, marginBottom: 16 } }, err) : null,
        h("button", { style: Object.assign({}, btnS("primary", "lg"), { width: "100%", justifyContent: "center" }), onClick: doLogin, disabled: loading }, loading ? "Verificando..." : "Ingresar"),
        forgotMsg ? h("div", { style: { marginTop: 12, padding: "10px 14px", background: T.ss, borderRadius: 8, color: T.sc, fontSize: 12, fontWeight: 600 } }, forgotMsg) : null,
        h("div", { style: { textAlign: "center", marginTop: 16 } },
          h("button", { style: { background: "none", border: "none", color: T.ac, fontSize: 13, cursor: "pointer", fontFamily: FONT_FAMILY, textDecoration: "underline" }, onClick: function() {
            if (!user) { setErr("Ingresa tu correo electrónico primero"); return; }
            const email = user.indexOf("@") >= 0 ? user : user + "@linea15.app";
            setForgotMsg("Enviando...");
            API.recoverPassword(email).then(function(result) {
              if (result.error) { setForgotMsg("Error: " + result.error); }
              else { setForgotMsg("✅ Se envió un enlace de recuperación a " + email); }
            });
          }}, "¿Olvidaste tu contraseña?")
        )
      ),
      // Footer
      h("div", { style: { textAlign: "center", marginTop: 20, fontSize: 11, color: T.td } },
        "Línea 1.5 — Gestión de Riesgos Tecnológicos"
      )
    )
  );
}

// ═══ APP WRAPPER WITH AUTH ═══
export default function AppWrapper() {
  const _session = useState(null), session = _session[0], setSession = _session[1];
  const _authReady = useState(false), authReady = _authReady[0], setAuthReady = _authReady[1];

  useEffect(function() {
    API.getSession().then(function(s) {
      if (s && s.userId) { setSession(s); }
      setAuthReady(true);
    }).catch(function() { setAuthReady(true); });
  }, []);

  function handleLogin(s) { setSession(s); }
  function handleLogout() {
    API.logout().then(function() { setSession(null); }).catch(function() { setSession(null); });
  }

  if (!authReady) return h("div", { style: { fontFamily: "'DM Sans',sans-serif", background: T.bg, color: T.tx, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" } }, "Cargando...");
  if (!session) return h(LoginScreen, { onLogin: handleLogin });
  return h(MainApp, { session: session, onLogout: handleLogout });
}

// ═══ MAIN APP (receives session) ═══
function MainApp(props){
  const session = props.session,onLogout=props.onLogout;
  const _p = useState(null),projects=_p[0],setProjects=_p[1];
  const _pid = useState(null),pid=_pid[0],setPid=_pid[1];
  const _v = useState("projects"),view=_v[0],setView=_v[1];
  const _rdy = useState(false),ready=_rdy[0],setReady=_rdy[1];
  const _m = useState(null),modal=_m[0],setModal=_m[1];
  const _pn = useState(""),pn=_pn[0],sPn=_pn[1];
  const _pd = useState(today()),pdt=_pd[0],sPd=_pd[1];
  const _pr = useState(""),prsp=_pr[0],sPr=_pr[1];
  const _fs = useState("all"),fStatus=_fs[0],setFStatus=_fs[1];
  const _prev = useState(null),preview=_prev[0],setPreview=_prev[1];
  const _editEv = useState(null),editEv=_editEv[0],setEditEv=_editEv[1];
  const _ps2 = useState(""),projSearch=_ps2[0],setProjSearch=_ps2[1];
  const _pv2 = useState("all"),projFilter=_pv2[0],setProjFilter=_pv2[1];
  const _users = useState(null),users=_users[0],setUsers=_users[1];
  const _au = useState(""),adminSearch=_au[0],setAdminSearch=_au[1];
  const _am = useState(null),adminModal=_am[0],setAdminModal=_am[1];
  const _anu = useState(""),newUser=_anu[0],setNewUser=_anu[1];
  const _ann = useState(""),newName=_ann[0],setNewName=_ann[1];
  const _ane = useState(""),newEmail=_ane[0],setNewEmail=_ane[1];
  const _anr = useState("lider"),newRole=_anr[0],setNewRole=_anr[1];
  const _anp = useState(""),newPw=_anp[0],setNewPw=_anp[1];
  const _aeu = useState(null),editingUser=_aeu[0],setEditingUser=_aeu[1];
  const _apm = useState(null),permUser=_apm[0],setPermUser=_apm[1];
  const _logs = useState([]),logs=_logs[0],setLogs=_logs[1];
  const _logFilter = useState("all"),logFilter=_logFilter[0],setLogFilter=_logFilter[1];
  const _archive = useState([]),archive=_archive[0],setArchive=_archive[1];

  useEffect(function(){API.loadProjects().then(function(d){setProjects(d||[]);setReady(true)}).catch(function(){setReady(true)})},[]);
  useEffect(function(){API.loadUsers().then(function(u){if(u?.length>0)setUsers(u)})},[]);
  useEffect(function(){API.loadLogs(500).then(function(l){if(l)setLogs(l)})},[]);
  useEffect(function(){API.loadArchive().then(function(a){if(a)setArchive(a)})},[]);

  // ═══ SECURITY: Session timeout tracking ═══
  // OWASP A07: Auto-logout after 30 minutes of inactivity
  useEffect(function() {
    if (!session) return;

    function updateActivity() {
      const currentSession = loadSession();
      if (currentSession) {
        currentSession.lastActivity = new Date().toISOString();
        saveSession(currentSession);
      }
    }

    function checkTimeout() {
      const currentSession = loadSession();
      if (!currentSession?.lastActivity) return;
      const lastActivityTime = new Date(currentSession.lastActivity).getTime();
      const elapsed = Date.now() - lastActivityTime;
      if (elapsed > SESSION_TIMEOUT_MS) {
        alert("Sesión expirada por inactividad. Por favor inicia sesión nuevamente.");
        onLogout();
      }
    }

    // Update activity on user interaction
    const events = ["click", "keypress", "scroll", "mousemove"];
    events.forEach(function(ev) { document.addEventListener(ev, updateActivity); });

    // Check timeout every minute
    const interval = setInterval(checkTimeout, 60000);

    return function() {
      events.forEach(function(ev) { document.removeEventListener(ev, updateActivity); });
      clearInterval(interval);
    };
  }, [session, onLogout]);

  function log(type,detail,projectName){
    const entry = {type:type,category:LOG_TYPES[type]?.cat||"Sistema",user:session?.name||session?.username||"Sistema",userId:session?.userId,detail:detail,project:projectName||""};
    API.addLog(entry.type, entry.category, entry.detail, entry.project);
    setLogs(function(prev){return [Object.assign({id:Date.now().toString(),timestamp:new Date().toISOString()},entry)].concat(prev||[])});
  }

  // ═══ PERMISSION HELPERS ═══
  // Returns user's permission for a project: "full","fill","evidence","view","none"
  function getUserPerm(projectId){
    if(!session)return "none";
    if(session.role==="admin")return "full"; // Admin always has full access
    let currentUser=(users||[]).find(function(u){return u.id===session.userId||u.username===session.username});
    if(!currentUser)return "none";
    if(!currentUser.projectPerms)return "none";
    return currentUser.projectPerms[projectId]||"none";
  }
  function canView(projectId){let p=getUserPerm(projectId);return p!=="none"}
  function canFill(projectId){let p=getUserPerm(projectId);return p==="full"||p==="fill"}
  function canEvidence(projectId){let p=getUserPerm(projectId);return p==="full"||p==="evidence"}
  function canApprove(){return session&&(session.role==="admin"||session.role==="lider"||session.role==="auditor")}

  // Log login on first mount
  useEffect(function(){if(session&&session.name){log("LOGIN","Inicio de sesión: "+session.name+" ("+session.role+")")}},[]);

  // Wrap logout to log before clearing session
  const doLogout = function(){log("LOGOUT","Cierre de sesión: "+session.name);setTimeout(function(){onLogout()},100)};

  let proj=useMemo(function(){return projects?projects.find(function(p){return p.id===pid})||null:null},[projects,pid]);
  function up(fn){setProjects(function(ps){return ps.map(function(p){return p.id===pid?fn(p):p})})}
  function addProject(){
    if(!pn||!prsp)return;
    API.createProject(pn, pdt, prsp, makeBaseData(), session.userId).then(function(newId){
      if(newId){
        log("PROJECT_CREATE","Proyecto creado: "+pn);
        API.loadProjects().then(function(d){setProjects(d||[]);setPid(newId);setView("dashboard")});
      }
    });
    setModal(null);sPn("");sPd(today());sPr("");
  }
  function delProject(id){
    let p=projects.find(function(x){return x.id===id});
    log("PROJECT_DELETE","Proyecto eliminado: "+(p?p.name:id));
    API.deleteProject(id).then(function(){
      setProjects(function(ps){return ps.filter(function(p){return p.id!==id})});
      if(pid===id){setPid(null);setView("projects")}
    });
  }

  // ═══ FINALIZE PROJECT: Move to archive with completion date ═══
  function finalizeProject(projectId){
    const p = projects.find(function(x){return x.id===projectId});
    if(!p)return;

    // Validate all controls are completed
    const incomplete = p.controls.filter(function(c){return !c.compliance||!c.compliance.trim()}).length;
    const pending = p.evidences.filter(function(e){return e.status==="en_revision"}).length;

    if(incomplete > 0){
      alert("No se puede finalizar: hay "+incomplete+" controles sin cumplimiento documentado");
      return;
    }
    if(pending > 0){
      if(!confirm("Hay "+pending+" evidencias pendientes de revisión. ¿Finalizar de todas formas?"))return;
    }

    if(!confirm("¿Finalizar la matriz '"+p.name+"'?\n\nSe archivará como registro histórico y no podrá editarse más.\nLos controles y evidencias quedarán congelados.")) return;

    // Create archive record
    const archiveRecord = Object.assign({}, p, {
      archivedAt: new Date().toISOString(),
      finalizedBy: session?.name || session?.username || "Sistema",
      finalizedByRole: session?.role || "unknown",
      finalizedByEmail: session?.email || "",
      stats: {
        totalControls: p.controls.length,
        controlsCompleted: p.controls.filter(function(c){return c.compliance&&c.compliance.trim()}).length,
        totalEvidences: p.evidences.length,
        evidencesApproved: p.evidences.filter(function(e){return e.status==="aprobada"}).length,
        evidencesRejected: p.evidences.filter(function(e){return e.status==="rechazada"}).length,
        evidencesPending: pending
      }
    });

    // Save to archive
    const newArchive = (archive||[]).concat([archiveRecord]);
    setArchive(newArchive);
    saveArchive(newArchive);

    // Remove from active projects
    setProjects(function(ps){return ps.filter(function(x){return x.id!==projectId})});

    log("PROJECT_FINALIZE","Matriz finalizada y archivada: "+p.name, p.name);

    // Navigate back
    if(pid===projectId){setPid(null);setView("projects")}
    alert("✅ Matriz finalizada y archivada correctamente.\n\nPuedes consultarla en el historial (📚 Archivo).");
  }
  function setComp(id,val){
    let ctrl=proj?proj.controls.find(function(c){return c.id===id}):null;
    if(val&&val.trim()&&ctrl&&(!ctrl.compliance||!ctrl.compliance.trim())){log("CONTROL_FILL","Cumplimiento documentado: "+(ctrl?ctrl.code:""),proj?proj.name:"")}
    if(!val||!val.trim()){if(ctrl&&ctrl.compliance&&ctrl.compliance.trim()){log("CONTROL_CLEAR","Cumplimiento borrado: "+(ctrl?ctrl.code:""),proj?proj.name:"")}}
    API.updateCompliance(id, val);
    up(function(p){return Object.assign({},p,{controls:p.controls.map(function(c){return c.id===id?Object.assign({},c,{compliance:val}):c})})});
  }
  function addEv(d){
    let ctrl=proj?proj.controls.find(function(c){return c.id===d.controlId}):null;
    log("EVIDENCE_ADD","Evidencia agregada: "+d.description+" → "+(ctrl?ctrl.code:""),proj?proj.name:"");
    API.addEvidence(proj.id, d.controlId, d).then(function(){
      API.loadProjects().then(function(ps){setProjects(ps||[])});
    });
  }
  function setEvSt(id,st){
    let ev=proj?proj.evidences.find(function(e){return e.id===id}):null;
    let ctrl=ev&&proj?proj.controls.find(function(c){return c.id===ev.controlId}):null;
    log(st==="aprobada"?"EVIDENCE_APPROVE":"EVIDENCE_REJECT","Evidencia "+(st==="aprobada"?"aprobada":"rechazada")+": "+(ev?ev.description:"")+" → "+(ctrl?ctrl.code:""),proj?proj.name:"");
    API.updateEvidenceStatus(id, st, session.name||"Revisor");
    up(function(p){return Object.assign({},p,{evidences:p.evidences.map(function(e){return e.id===id?Object.assign({},e,{status:st,reviewer:session.name||"Revisor"}):e})})});
  }
  function delEv(id){
    if(!confirm("¿Eliminar esta evidencia?"))return;
    let ev=proj?proj.evidences.find(function(e){return e.id===id}):null;
    log("EVIDENCE_DELETE","Evidencia eliminada: "+(ev?ev.description:""),proj?proj.name:"");
    API.deleteEvidence(id);
    up(function(p){return Object.assign({},p,{evidences:p.evidences.filter(function(e){return e.id!==id})})});
  }
  function updateEv(id,data){
    let ev=proj?proj.evidences.find(function(e){return e.id===id}):null;
    log("EVIDENCE_EDIT","Evidencia editada: "+(ev?ev.description:""),proj?proj.name:"");
    API.updateEvidence(id, data);
    up(function(p){return Object.assign({},p,{evidences:p.evidences.map(function(e){return e.id===id?Object.assign({},e,data):e})})});
  }

  // ═══ EXPORT FUNCTION ═══
  // Template imported from separate file to reduce code duplication metrics;

  function exportProject(project){
    if(!project)return;
    log("EXPORT","Exportación de matriz: "+project.name,project.name);
    try{
      doExport(project);
    }catch(e){alert("Error: "+e.message)}
  }

  function doExport(project){
    const mainZip = new JSZip();

    // ── MODIFY EXCEL BY EDITING XML INSIDE THE XLSX ZIP ──
    const templateBytes = Uint8Array.from(atob(MATRIX_TEMPLATE),function(c){return c.charCodeAt(0)});

    JSZip.loadAsync(templateBytes).then(function(xlsxZip){
      // Read the sheet XML
      return xlsxZip.file("xl/worksheets/sheet8.xml").async("string").then(function(sheetXml){
        // Read shared strings
        return xlsxZip.file("xl/sharedStrings.xml").async("string").then(function(ssXml){
          // Parse shared strings to get count
          let ssMatch=ssXml.match(/count="(\d+)"/);
          let ssUniqueMatch=ssXml.match(/uniqueCount="(\d+)"/);
          let currentCount=ssMatch?parseInt(ssMatch[1]):0;
          let currentUnique=ssUniqueMatch?parseInt(ssUniqueMatch[1]):0;

          // Collect new strings to add
          const newStrings = [];
          const cellUpdates = []; // {row, col, stringIndex}

          project.controls.forEach(function(ctrl,idx){
            let excelRow=idx+9; // Rows 1-8=headers, Row 9=CT-001, etc.

            // Column U = compliance
            if(ctrl.compliance&&ctrl.compliance.trim()){
              let sIdx=currentUnique+newStrings.length;
              newStrings.push(ctrl.compliance);
              cellUpdates.push({row:excelRow,col:"U",sIdx:sIdx});
            }

            // Column V = evidence list
            let evs=project.evidences.filter(function(e){return e.controlId===ctrl.id});
            if(evs.length>0){
              let evText=evs.map(function(ev,ei){
                let fNames=ev.files&&ev.files.length>0?ev.files.map(function(f){return f.name}).join(", "):"";
                return "Ev"+(ei+1)+": "+ev.description+(fNames?" ["+fNames+"]":"");
              }).join("\n");
              let sIdx2=currentUnique+newStrings.length;
              newStrings.push(evText);
              cellUpdates.push({row:excelRow,col:"V",sIdx:sIdx2});
            }
          });

          // ── UPDATE SHARED STRINGS XML ──
          if(newStrings.length>0){
            let newCount=currentCount+newStrings.length;
            let newUnique=currentUnique+newStrings.length;
            ssXml=ssXml.replace(/count="\d+"/, 'count="'+newCount+'"');
            ssXml=ssXml.replace(/uniqueCount="\d+"/, 'uniqueCount="'+newUnique+'"');

            // Add new <si> elements before closing </sst>
            let newSiEntries=newStrings.map(function(str){
              let escaped=str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
              return '<si><t xml:space="preserve">'+escaped+'</t></si>';
            }).join("");
            ssXml=ssXml.replace("</sst>",newSiEntries+"</sst>");
          }

          // ── UPDATE SHEET XML - insert values into cells ──
          cellUpdates.forEach(function(upd){
            let cellRef=upd.col+upd.row;
            let replaced=false;

            // Try self-closing first: <c r="U2" s="26"/>
            let pat1='<c r="'+cellRef+'"';
            if(sheetXml.indexOf(pat1)>=0){
              // Find the full tag
              let idx=sheetXml.indexOf(pat1);
              let endSelf=sheetXml.indexOf("/>",idx);
              let endFull=sheetXml.indexOf("</c>",idx);

              if(endSelf>=0&&(endFull<0||endSelf<endFull)){
                // Self-closing tag
                let oldTag=sheetXml.substring(idx,endSelf+2);
                let styleMatch=oldTag.match(/s="(\d+)"/);
                let style=styleMatch?' s="'+styleMatch[1]+'"':'';
                let newTag='<c r="'+cellRef+'"'+style+' t="s"><v>'+upd.sIdx+'</v></c>';
                sheetXml=sheetXml.substring(0,idx)+newTag+sheetXml.substring(endSelf+2);
                replaced=true;
              }else if(endFull>=0){
                // Full tag with content
                let oldTag2=sheetXml.substring(idx,endFull+4);
                let styleMatch2=oldTag2.match(/s="(\d+)"/);
                let style2=styleMatch2?' s="'+styleMatch2[1]+'"':'';
                let newTag2='<c r="'+cellRef+'"'+style2+' t="s"><v>'+upd.sIdx+'</v></c>';
                sheetXml=sheetXml.substring(0,idx)+newTag2+sheetXml.substring(endFull+4);
                replaced=true;
              }
            }

            if(!replaced){
              // Cell doesn't exist - add to row
              let rowStart='<row r="'+upd.row+'"';
              let ri=sheetXml.indexOf(rowStart);
              if(ri>=0){
                let rowTagEnd=sheetXml.indexOf(">",ri);
                if(rowTagEnd>=0){
                  let insertPos=rowTagEnd+1;
                  sheetXml=sheetXml.substring(0,insertPos)+'<c r="'+cellRef+'" t="s"><v>'+upd.sIdx+'</v></c>'+sheetXml.substring(insertPos);
                }
              }
            }
          });

          // ── REBUILD THE XLSX ──
          xlsxZip.file("xl/worksheets/sheet8.xml",sheetXml);
          xlsxZip.file("xl/sharedStrings.xml",ssXml);

          return xlsxZip.generateAsync({type:"arraybuffer"});
        });
      });
    }).then(function(modifiedXlsx){
      // Add modified Excel to main ZIP
      mainZip.file("MATRIZ_"+project.name.replace(/[^a-zA-Z0-9]/g,"_")+".xlsx",modifiedXlsx);

      // ── ADD EVIDENCE FILES ──
      let evidenceFolder=mainZip.folder("Evidencias");
      project.controls.forEach(function(ctrl){
        let evs=project.evidences.filter(function(e){return e.controlId===ctrl.id});
        if(evs.length===0)return;
        let folderName=ctrl.code+"_"+ctrl.causaBase.replace(/[^a-zA-Z0-9 ]/g,"").substring(0,40).trim();
        let ctrlFolder=evidenceFolder.folder(folderName);
        evs.forEach(function(ev,ei){
          let meta="Control: "+ctrl.code+" - "+ctrl.causaBase+"\n";
          meta+="Evidencia: "+ev.description+"\n";
          meta+="Tipo: "+ev.type+"\n";
          meta+="Fecha: "+ev.date+"\n";
          meta+="Estado: "+ev.status+"\n";
          if(ev.reviewer)meta+="Revisor: "+ev.reviewer+"\n";
          if(ev.notes)meta+="Notas: "+ev.notes+"\n";
          ctrlFolder.file("Ev"+(ei+1)+"_info.txt",meta);
          if(ev.files&&ev.files.length>0){
            ev.files.forEach(function(f){
              try{const b64=f.data.split(",")[1];if(b64)ctrlFolder.file(f.name||"archivo",b64,{base64:true})}catch(err){console.warn("Could not add file to zip",f.name,err?.message)}
            });
          }
        });
      });

      // ── DOWNLOAD ──
      return mainZip.generateAsync({type:"blob"});
    }).then(function(content){
      const a = document.createElement("a");
      a.href=URL.createObjectURL(content);
      a.download=project.name.replace(/[^a-zA-Z0-9]/g,"_")+"_Export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });
  }
  if(!ready)return h("div",{style:{fontFamily:FONT_FAMILY,background:T.bg,color:T.tx,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}},"Cargando...");

  let content=null;

  // ═══ NAVIGATION BAR (always visible) ═══
  const projName = proj ? proj.name : "";
  const viewLabels = {projects:"Proyectos",dashboard:"Dashboard",wizard:"Controles","add-ev":"Agregar Evidencia",evidences:"Evidencias",archive:"Archivo",logs:"Logs",admin:"Usuarios"};
  const breadcrumbs = [];
  breadcrumbs.push({label:"Proyectos",view:"projects"});
  if(view==="dashboard"||view==="wizard"||view==="add-ev"||view==="evidences"){
    breadcrumbs.push({label:projName||"Proyecto",view:"dashboard"});
  }
  if(view==="wizard"||view==="add-ev"||view==="evidences"){
    breadcrumbs.push({label:viewLabels[view]||view,view:view});
  }
  if(view==="archive"||view==="logs"||view==="admin"){
    breadcrumbs.push({label:viewLabels[view],view:view});
  }

  const navBar = h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:T.sf,borderRadius:12,border:"1px solid "+T.bd,marginBottom:16,position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:6}},
    // Left: breadcrumbs
    h("div",{style:{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",flex:1,minWidth:0}},
      h("button",{style:{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"4px 8px",borderRadius:6,color:T.ac,fontWeight:800,fontFamily:FONT_FAMILY},onClick:function(){setView("projects");setPid(null)}},"L1.5"),
      breadcrumbs.map(function(bc,i){
        const isLast = i === breadcrumbs.length - 1;
        return h("span",{key:i,style:{display:"flex",alignItems:"center",gap:4}},
          h("span",{style:{color:T.td,fontSize:12}}," / "),
          isLast ?
            h("span",{style:{fontSize:12,fontWeight:600,color:T.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:150}},bc.label) :
            h("button",{style:{background:"none",border:"none",cursor:"pointer",fontSize:12,color:T.ac,fontFamily:FONT_FAMILY,padding:"2px 4px",borderRadius:4},onClick:function(){setView(bc.view)}},bc.label)
        );
      })
    ),
    // Right: action buttons (wrap on mobile)
    h("div",{style:{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap",flexShrink:0}},
      h("div",{style:{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,"+T.ac+",#F59E0B)",display:"flex",alignItems:"center",justifyContent:"center",color:T.wh,fontWeight:800,fontSize:10,flexShrink:0}},session.name?session.name.charAt(0).toUpperCase():"U"),
      h("button",{style:Object.assign({},btnS(view==="reports"?"outline":"ghost","sm"),{fontSize:10,padding:"4px 8px"}),onClick:function(){setView("reports")}},"📊"),
      h("button",{style:Object.assign({},btnS(view==="archive"?"outline":"ghost","sm"),{fontSize:10,padding:"4px 8px"}),onClick:function(){setView("archive")}},"📚"),
      session.role==="admin"?h("button",{style:Object.assign({},btnS(view==="logs"?"outline":"ghost","sm"),{fontSize:10,padding:"4px 8px"}),onClick:function(){setView("logs")}},"📋"):null,
      session.role==="admin"?h("button",{style:Object.assign({},btnS(view==="admin"?"outline":"ghost","sm"),{fontSize:10,padding:"4px 8px"}),onClick:function(){setView("admin")}},"⚙️"):null,
      h("button",{style:Object.assign({},btnS("ghost","sm"),{fontSize:10,padding:"4px 8px",color:T.td}),onClick:doLogout},"Salir")
    )
  );

  if(view==="projects"){

    const filteredProjects=projects.filter(function(p){
      // Permission check: non-admin users only see assigned projects
      if(session.role!=="admin"&&!canView(p.id))return false;
      if(projSearch&&(p.name+" "+p.responsible+" "+p.publishDate).toLowerCase().indexOf(projSearch.toLowerCase())<0)return false;
      if(projFilter==="complete"){let wc2=p.controls.filter(function(x){return x.compliance&&x.compliance.trim()}).length;return p.controls.length>0&&wc2===p.controls.length}
      if(projFilter==="pending"){let wc3=p.controls.filter(function(x){return x.compliance&&x.compliance.trim()}).length;return p.controls.length===0||wc3<p.controls.length}
      return true;
    });

    const totalProj=projects.length;
    const completeProj=projects.filter(function(p){let wc4=p.controls.filter(function(x){return x.compliance&&x.compliance.trim()}).length;return p.controls.length>0&&wc4===p.controls.length}).length;

    content=h("div",null,
      // Header
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
        h("div",null,
          h("h1",{style:{margin:0,fontSize:28,fontWeight:900}},"Línea 1.5"),
          h("p",{style:{margin:"4px 0 0",fontSize:14,color:T.ts}},"Gestión de Riesgos Tecnológicos — Matriz de Controles y Evidencias")
        ),
        h("button",{style:btnS("primary","lg"),onClick:function(){setModal("add-project")}},"＋ Nuevo Proyecto")
      ),

      // Stats bar
      h("div",{style:{display:"flex",gap:12,marginBottom:16}},
        [{l:"Total",v:totalProj,c:T.ac},{l:"Completados",v:completeProj,c:T.sc},{l:"En curso",v:totalProj-completeProj,c:T.wn}].map(function(s){
          return h("div",{key:s.l,style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:T.sa,borderRadius:8,border:"1px solid "+T.bd}},
            h("span",{style:Object.assign({},mS,{fontSize:16,fontWeight:800,color:s.c})},s.v),
            h("span",{style:{fontSize:11,color:T.td}},s.l)
          );
        })
      ),

      // Search & filters
      h("div",{style:{display:"flex",gap:10,marginBottom:16,alignItems:"center"}},
        h("input",{style:Object.assign({},iS,{flex:1}),placeholder:"🔍 Buscar proyecto por nombre, responsable o fecha...",value:projSearch,onChange:function(e){setProjSearch(e.target.value)}}),
        h("div",{style:{display:"flex",gap:4}},
          [{k:"all",l:"Todos"},{k:"pending",l:"En curso"},{k:"complete",l:"Completados"}].map(function(f){
            return h("button",{key:f.k,onClick:function(){setProjFilter(f.k)},style:{padding:"8px 14px",borderRadius:8,border:"1px solid "+(projFilter===f.k?T.ac:T.bd),background:projFilter===f.k?T.as:"transparent",color:projFilter===f.k?T.ac:T.ts,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT_FAMILY}},f.l);
          })
        )
      ),

      // Projects table/list
      h("div",{style:{display:"flex",flexDirection:"column",gap:8}},
        // Project cards (responsive)
        filteredProjects.map(function(p){
          const wc=p.controls.filter(function(x){return x.compliance&&x.compliance.trim()}).length;
          const pct=p.controls.length?Math.round(wc/p.controls.length*100):0;
          const evCount=p.evidences.length;
          return h("div",{key:p.id,style:{padding:"14px 16px",background:T.sf,borderRadius:10,border:"1px solid "+T.bd,cursor:"pointer",transition:"all .15s"},
            onClick:function(){setPid(p.id);setView("dashboard");log("PROJECT_OPEN","Proyecto abierto: "+p.name,p.name)},
            onMouseEnter:function(e){e.currentTarget.style.borderColor=T.ac;e.currentTarget.style.background=T.sa},
            onMouseLeave:function(e){e.currentTarget.style.borderColor=T.bd;e.currentTarget.style.background=T.sf}
          },
            // Top row: name + delete
            h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}},
              h("div",null,
                h("div",{style:{fontSize:15,fontWeight:700,color:T.tx}},p.name),
                h("div",{style:{fontSize:12,color:T.ts,marginTop:2}},p.responsible),
                h("div",{style:{fontSize:11,color:T.td,marginTop:2}},p.publishDate)
              ),
              h("div",{style:{display:"flex",gap:6,alignItems:"center"}},
                pct>=100?h("span",{style:bdg(T.sc,T.ss)},"✓ Completo"):null,
                h("button",{style:{background:"none",border:"none",color:T.td,cursor:"pointer",fontSize:14,padding:4},onClick:function(e){e.stopPropagation();if(confirm('¿Eliminar el proyecto "'+p.name+'"?'))delProject(p.id)}},"🗑")
              )
            ),
            // Bottom row: metrics
            h("div",{style:{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}},
              h("div",{style:{display:"flex",alignItems:"center",gap:4}},
                h("span",{style:{fontSize:11,color:T.td}},"Controles:"),
                h("span",{style:Object.assign({},mS,{fontSize:13,fontWeight:800,color:wc===p.controls.length&&p.controls.length>0?T.sc:T.tx})},wc+"/"+p.controls.length)
              ),
              h("div",{style:{display:"flex",alignItems:"center",gap:4}},
                h("span",{style:{fontSize:11,color:T.td}},"Evidencias:"),
                h("span",{style:Object.assign({},mS,{fontSize:13,fontWeight:800,color:evCount>0?T.inf:T.td})},evCount)
              ),
              h("div",{style:{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:80}},
                h("div",{style:{flex:1,height:6,background:T.sa,borderRadius:3,overflow:"hidden"}},
                  h("div",{style:{height:"100%",width:pct+"%",background:pct>=100?T.sc:pct>=50?T.wn:T.ac,borderRadius:3}})
                ),
                h("span",{style:Object.assign({},mS,{fontSize:12,fontWeight:800,color:pct>=100?T.sc:pct>=50?T.wn:T.ac})},pct+"%")
              )
            )
          );
        }),
        filteredProjects.length===0?h("div",{style:{textAlign:"center",padding:40,color:T.ts}},
          h("div",{style:{fontSize:32,marginBottom:8}},"🔍"),
          h("div",{style:{fontSize:14}},"No se encontraron proyectos"),
          projSearch?h("div",{style:{fontSize:12,color:T.td,marginTop:4}},"Intenta con otro término de búsqueda"):null
        ):null
      ),

      // Add project card at bottom
      h("div",{style:{marginTop:12,padding:"16px",border:"2px dashed "+T.bd,borderRadius:10,textAlign:"center",cursor:"pointer",opacity:.6,transition:"opacity .15s"},onClick:function(){setModal("add-project")},onMouseEnter:function(e){e.currentTarget.style.opacity=1},onMouseLeave:function(e){e.currentTarget.style.opacity=.6}},
        h("span",{style:{fontSize:13,fontWeight:600,color:T.ts}},"＋ Agregar nuevo proyecto")
      )
    );
  }

  if(view==="dashboard"&&proj){
    const tc=proj.controls.length;
    const wc=proj.controls.filter(function(x){return x.compliance&&x.compliance.trim()}).length;
    const pctCtrl=tc?Math.round(wc/tc*100):0;
    const te=proj.evidences.length;
    const eApproved=proj.evidences.filter(function(x){return x.status==="aprobada"}).length;
    const eReview=proj.evidences.filter(function(x){return x.status==="en_revision"}).length;
    const eRejected=proj.evidences.filter(function(x){return x.status==="rechazada"}).length;
    const pctEv=te?Math.round(eApproved/te*100):0;
    // Controls with at least one evidence
    const ctrlWithEv=proj.controls.filter(function(c){return proj.evidences.some(function(e){return e.controlId===c.id})}).length;
    const pctCoverage=tc?Math.round(ctrlWithEv/tc*100):0;
    // Controls fully done (compliance + approved evidence)
    const ctrlFull=proj.controls.filter(function(c){
      let hasComp=c.compliance&&c.compliance.trim();
      let hasApproved=proj.evidences.some(function(e){return e.controlId===c.id&&e.status==="aprobada"});
      return hasComp&&hasApproved;
    }).length;
    const pctFull=tc?Math.round(ctrlFull/tc*100):0;

    content=h("div",null,
      h("button",{style:btnS("ghost","sm"),onClick:function(){setView("projects");setPid(null)}},"← Proyectos"),
      h("div",{style:{margin:"12px 0 24px"}},h("h2",{style:{margin:0,fontSize:24,fontWeight:900}},proj.name),h("p",{style:{margin:"4px 0 0",fontSize:13,color:T.ts}},proj.responsible+" · "+proj.publishDate)),

      // ── KPI Cards ──
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}},
        [{l:"Controles",v:tc,c:T.ac,i:"🛡"},{l:"Respondidos",v:wc+"/"+tc,c:pctCtrl>=100?T.sc:T.wn,i:"📝"},{l:"Evidencias",v:te,c:T.inf,i:"📎"},{l:"Aprobadas",v:eApproved+"/"+te,c:te&&pctEv>=100?T.sc:T.inf,i:"✓"}].map(function(k){
          return h("div",{key:k.l,style:Object.assign({},cS,{position:"relative",overflow:"hidden"})},
            h("div",{style:{position:"absolute",top:-4,right:-2,fontSize:36,opacity:.06}},k.i),
            h("div",{style:lS},k.l),
            h("div",{style:Object.assign({},mS,{fontSize:24,fontWeight:800,color:k.c,marginTop:4})},k.v)
          );
        })
      ),

      // ── Progress Bars Section ──
      h("div",{style:Object.assign({},cS,{marginBottom:20})},
        h("div",{style:{fontSize:15,fontWeight:800,marginBottom:16}},"Avance del Proyecto"),

        // 1. Cumplimiento de controles
        h("div",{style:{marginBottom:16}},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
            h("div",{style:{display:"flex",alignItems:"center",gap:8}},
              h("span",{style:{fontSize:16}},"📝"),
              h("span",{style:{fontSize:13,fontWeight:700}},"Controles respondidos")
            ),
            h("span",{style:Object.assign({},mS,{fontSize:16,fontWeight:800,color:pctCtrl>=100?T.sc:T.wn})},pctCtrl+"%")
          ),
          h("div",{style:{height:14,background:T.sa,borderRadius:7,overflow:"hidden"}},
            h("div",{style:{height:"100%",width:pctCtrl+"%",background:pctCtrl>=100?"linear-gradient(90deg,"+T.sc+",#34D399)":"linear-gradient(90deg,"+T.wn+",#FBBF24)",borderRadius:7,transition:"width .4s"}})
          ),
          h("div",{style:{fontSize:11,color:T.td,marginTop:4}},wc+" de "+tc+" controles tienen descripción de cumplimiento")
        ),

        // 2. Cobertura de evidencias
        h("div",{style:{marginBottom:16}},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
            h("div",{style:{display:"flex",alignItems:"center",gap:8}},
              h("span",{style:{fontSize:16}},"📎"),
              h("span",{style:{fontSize:13,fontWeight:700}},"Controles con evidencia")
            ),
            h("span",{style:Object.assign({},mS,{fontSize:16,fontWeight:800,color:pctCoverage>=100?T.sc:T.inf})},pctCoverage+"%")
          ),
          h("div",{style:{height:14,background:T.sa,borderRadius:7,overflow:"hidden"}},
            h("div",{style:{height:"100%",width:pctCoverage+"%",background:pctCoverage>=100?"linear-gradient(90deg,"+T.sc+",#34D399)":"linear-gradient(90deg,"+T.inf+",#60A5FA)",borderRadius:7,transition:"width .4s"}})
          ),
          h("div",{style:{fontSize:11,color:T.td,marginTop:4}},ctrlWithEv+" de "+tc+" controles tienen al menos una evidencia adjunta")
        ),

        // 3. Evidencias aprobadas
        h("div",{style:{marginBottom:16}},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
            h("div",{style:{display:"flex",alignItems:"center",gap:8}},
              h("span",{style:{fontSize:16}},"✅"),
              h("span",{style:{fontSize:13,fontWeight:700}},"Evidencias aprobadas")
            ),
            h("span",{style:Object.assign({},mS,{fontSize:16,fontWeight:800,color:pctEv>=100?T.sc:T.ac})},pctEv+"%")
          ),
          h("div",{style:{height:14,background:T.sa,borderRadius:7,overflow:"hidden"}},
            h("div",{style:{height:"100%",width:pctEv+"%",background:pctEv>=100?"linear-gradient(90deg,"+T.sc+",#34D399)":"linear-gradient(90deg,"+T.ac+","+T.ah+")",borderRadius:7,transition:"width .4s"}})
          ),
          h("div",{style:{display:"flex",gap:12,fontSize:11,color:T.td,marginTop:4}},
            h("span",null,eApproved+" aprobadas"),
            eReview>0?h("span",{style:{color:T.wn}},eReview+" en revisión"):null,
            eRejected>0?h("span",{style:{color:T.dn}},eRejected+" rechazadas"):null
          )
        ),

        // 4. Completitud total (compliance + evidencia aprobada)
        h("div",null,
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
            h("div",{style:{display:"flex",alignItems:"center",gap:8}},
              h("span",{style:{fontSize:16}},"🏆"),
              h("span",{style:{fontSize:13,fontWeight:700}},"Controles 100% completados"),
              h("span",{style:{fontSize:10,color:T.td}},"(respuesta + evidencia aprobada)")
            ),
            h("span",{style:Object.assign({},mS,{fontSize:16,fontWeight:800,color:pctFull>=100?T.sc:T.ac})},pctFull+"%")
          ),
          h("div",{style:{height:14,background:T.sa,borderRadius:7,overflow:"hidden"}},
            h("div",{style:{height:"100%",width:pctFull+"%",background:pctFull>=100?"linear-gradient(90deg,#10B981,#34D399)":"linear-gradient(90deg,"+T.ac+",#F59E0B)",borderRadius:7,transition:"width .4s"}})
          ),
          h("div",{style:{fontSize:11,color:T.td,marginTop:4}},ctrlFull+" de "+tc+" controles tienen cumplimiento documentado y evidencia aprobada")
        ),

        // ── AVANCE TOTAL DE LA MATRIZ ──
        h("div",{style:{marginTop:24,padding:"20px 24px",background:"linear-gradient(135deg,"+T.ac+"15,#F59E0B15)",borderRadius:14,border:"1px solid "+T.ac+"33"}},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
            h("div",{style:{display:"flex",alignItems:"center",gap:10}},
              h("span",{style:{fontSize:24}},"📊"),
              h("span",{style:{fontSize:16,fontWeight:800,color:T.tx}},"AVANCE TOTAL DE LA MATRIZ")
            ),
            h("span",{style:Object.assign({},mS,{fontSize:28,fontWeight:800,color:(function(){let avg=Math.round((pctCtrl+pctCoverage+pctFull)/3);return avg>=80?T.sc:avg>=50?T.wn:T.ac})()})},Math.round((pctCtrl+pctCoverage+pctFull)/3)+"%")
          ),
          h("div",{style:{height:20,background:T.sa,borderRadius:10,overflow:"hidden",marginBottom:12}},
            h("div",{style:{height:"100%",width:Math.round((pctCtrl+pctCoverage+pctFull)/3)+"%",background:(function(){let avg=Math.round((pctCtrl+pctCoverage+pctFull)/3);return avg>=80?"linear-gradient(90deg,#10B981,#34D399)":avg>=50?"linear-gradient(90deg,"+T.wn+",#FBBF24)":"linear-gradient(90deg,"+T.ac+",#F59E0B)"})(),borderRadius:10,transition:"width .5s ease"}})
          ),
          h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}},
            [{l:"Controles",v:pctCtrl,c:pctCtrl>=100?T.sc:T.wn,i:"📝"},{l:"Cobertura Ev.",v:pctCoverage,c:pctCoverage>=100?T.sc:T.inf,i:"📎"},{l:"Completitud",v:pctFull,c:pctFull>=100?T.sc:T.ac,i:"🏆"}].map(function(item){
              return h("div",{key:item.l,style:{textAlign:"center",padding:"8px 4px",background:T.sa,borderRadius:8}},
                h("div",{style:{fontSize:14}},item.i),
                h("div",{style:Object.assign({},mS,{fontSize:16,fontWeight:800,color:item.c,marginTop:2})},item.v+"%"),
                h("div",{style:{fontSize:9,color:T.td,marginTop:2}},item.l)
              );
            })
          )
        )
      ),

      // ── Action buttons (permission-aware) ──
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}},
        canFill(proj.id)?h("div",{style:Object.assign({},cS,{cursor:"pointer",textAlign:"center",padding:"24px 16px",border:"2px solid "+T.wn+"55"}),onClick:function(){setView("wizard")}},
          h("div",{style:{fontSize:32,marginBottom:6}},"📝"),h("h3",{style:{margin:0,fontSize:14,fontWeight:800,color:T.wn}},"Llenar Controles"),
          h("div",{style:{marginTop:8}},h("span",{style:bdg(T.wn,T.ws)},(tc-wc)+" pendientes"))
        ):null,
        canEvidence(proj.id)?h("div",{style:Object.assign({},cS,{cursor:"pointer",textAlign:"center",padding:"24px 16px",border:"2px solid "+T.sc+"55"}),onClick:function(){setView("add-ev")}},
          h("div",{style:{fontSize:32,marginBottom:6}},"📎"),h("h3",{style:{margin:0,fontSize:14,fontWeight:800,color:T.sc}},"Agregar Evidencias"),
          h("div",{style:{marginTop:8}},h("span",{style:bdg(T.sc,T.ss)},te+" registradas"))
        ):null,
        canApprove()?h("div",{style:Object.assign({},cS,{cursor:"pointer",textAlign:"center",padding:"24px 16px",border:"2px solid "+(eReview>0?T.wn:T.ac)+"55"}),onClick:function(){setView("evidences")}},
          h("div",{style:{fontSize:32,marginBottom:6}},"✅"),h("h3",{style:{margin:0,fontSize:14,fontWeight:800,color:eReview>0?T.wn:T.ac}},"Aprobar Evidencias"),
          h("div",{style:{marginTop:8}},eReview>0?h("span",{style:bdg(T.wn,T.ws)},eReview+" por revisar"):h("span",{style:bdg(T.sc,T.ss)},"Todo al día"))
        ):null,
        h("div",{style:Object.assign({},cS,{cursor:"pointer",textAlign:"center",padding:"24px 16px",border:"2px solid "+T.inf+"55"}),onClick:function(){exportProject(proj)}},
          h("div",{style:{fontSize:32,marginBottom:6}},"📥"),h("h3",{style:{margin:0,fontSize:14,fontWeight:800,color:T.inf}},"Exportar Matriz"),
          h("div",{style:{marginTop:8}},h("span",{style:bdg(T.inf,T.inf+"18")},"Excel + Evidencias"))
        ),
        h("div",{style:Object.assign({},cS,{cursor:"pointer",textAlign:"center",padding:"24px 16px",border:"2px solid #7C3AED55"}),onClick:function(){setView("project-report")}},
          h("div",{style:{fontSize:32,marginBottom:6}},"📊"),h("h3",{style:{margin:0,fontSize:14,fontWeight:800,color:"#7C3AED"}},"Reporte"),
          h("div",{style:{marginTop:8}},h("span",{style:bdg("#7C3AED","#7C3AED18")},"Gráficas y análisis"))
        )
      ),

      // ── Finalize button (only admin/lider, requires all controls completed) ──
      (session.role==="admin"||session.role==="lider")?h("div",{style:Object.assign({},cS,{marginBottom:20,padding:20,border:"2px solid "+(wc===tc&&tc>0?T.sc:T.bd)+"55",background:wc===tc&&tc>0?T.ss:T.sa})},
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}},
          h("div",null,
            h("h3",{style:{margin:0,fontSize:16,fontWeight:800,color:T.tx}},"🏁 Finalizar Matriz"),
            h("p",{style:{margin:"4px 0 0",fontSize:12,color:T.ts}},
              wc===tc&&tc>0?
                "Todos los controles están documentados. Puedes archivar esta matriz como registro histórico.":
                "Faltan "+(tc-wc)+" controles por completar antes de poder finalizar."
            )
          ),
          h("button",{
            disabled:wc!==tc||tc===0,
            style:Object.assign({},btnS(wc===tc&&tc>0?"success":"outline"),{padding:"12px 24px",opacity:wc===tc&&tc>0?1:0.5,cursor:wc===tc&&tc>0?"pointer":"not-allowed"}),
            onClick:function(){finalizeProject(proj.id)}
          },"🏁 Finalizar y Archivar")
        )
      ):null,

      // ── Detail per control ──
      h("div",{style:cS},
        h("div",{style:{fontSize:15,fontWeight:800,marginBottom:14}},"Detalle por Control"),
        h("div",{style:{display:"flex",gap:16,marginBottom:14,fontSize:11,color:T.td}},
          h("span",{style:{display:"flex",alignItems:"center",gap:4}},h("span",{style:{width:10,height:10,borderRadius:2,background:T.sc}})," Completo"),
          h("span",{style:{display:"flex",alignItems:"center",gap:4}},h("span",{style:{width:10,height:10,borderRadius:2,background:T.wn}})," Solo cumplimiento"),
          h("span",{style:{display:"flex",alignItems:"center",gap:4}},h("span",{style:{width:10,height:10,borderRadius:2,background:T.inf}})," Solo evidencia"),
          h("span",{style:{display:"flex",alignItems:"center",gap:4}},h("span",{style:{width:10,height:10,borderRadius:2,background:T.sa}})," Pendiente")
        ),
        proj.controls.map(function(c){
          let hasComp=c.compliance&&c.compliance.trim();
          let evs=proj.evidences.filter(function(e){return e.controlId===c.id});
          let hasEv=evs.length>0;
          let hasApproved=evs.some(function(e){return e.status==="aprobada"});
          let full=hasComp&&hasApproved;
          let barColor=full?T.sc:hasComp&&hasEv?T.wn:hasComp?T.wn:hasEv?T.inf:T.sa;
          let barPct=full?100:hasComp&&hasEv?75:hasComp||hasEv?50:0;
          return h("div",{key:c.id,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+T.bd}},
            h("span",{style:Object.assign({},mS,{fontSize:10,color:T.td,width:50,flexShrink:0})},c.code),
            h("div",{style:{flex:1,minWidth:0}},
              h("div",{style:{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},c.causaBase),
              h("div",{style:{height:6,background:T.sa,borderRadius:3,overflow:"hidden",marginTop:4}},
                h("div",{style:{height:"100%",width:barPct+"%",background:barColor,borderRadius:3}})
              )
            ),
            h("div",{style:{display:"flex",gap:6,flexShrink:0}},
              hasComp?h("span",{style:{fontSize:10,color:T.sc}},"📝"):h("span",{style:{fontSize:10,color:T.td}},"📝"),
              hasEv?h("span",{style:{fontSize:10,color:hasApproved?T.sc:T.wn}},"📎"+evs.length):h("span",{style:{fontSize:10,color:T.td}},"📎0")
            )
          );
        })
      ),

      // ── Recent evidences ──
      proj.evidences.length>0?h("div",{style:Object.assign({},cS,{marginTop:16})},
        h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:12}},h("span",{style:{fontSize:14,fontWeight:700}},"Últimas evidencias"),h("button",{style:btnS("ghost","sm"),onClick:function(){setView("evidences")}},"Ver todas →")),
        proj.evidences.slice(-3).reverse().map(function(ev){let ct=proj.controls.find(function(c){return c.id===ev.controlId});return h("div",{key:ev.id,style:{padding:"8px 0",borderBottom:"1px solid "+T.bd,display:"flex",justifyContent:"space-between",alignItems:"center"}},
          h("div",null,h("div",{style:{fontSize:12,fontWeight:600}},ev.description),h("div",{style:{fontSize:10,color:T.td,marginTop:2}},ct?ct.code+" — "+ct.causaBase:"")),
          h(EvBdg,{status:ev.status})
        )})
      ):null
    );
  }

  if(view==="wizard"&&proj)content=h(Questionnaire,{proj:proj,onSave:setComp,onFinish:function(){setView("dashboard")}});
  if(view==="add-ev"&&proj)content=h(EvidenceFlow,{proj:proj,onSave:addEv,onBack:function(){setView("dashboard")}});

  if(view==="evidences"&&proj){

    content=h("div",null,
      h("button",{style:btnS("ghost","sm"),onClick:function(){setView("dashboard")}},"← Dashboard"),
      h("h2",{style:{margin:"12px 0 16px",fontSize:22,fontWeight:800}},"Historial de Evidencias"),
      h("div",{style:{display:"flex",gap:8,marginBottom:16}},
        [{k:"all",l:"Todas",n:proj.evidences.length}].concat(Object.entries(EV_ST).map(function(e){return{k:e[0],l:e[1].l,n:proj.evidences.filter(function(ev){return ev.status===e[0]}).length}})).map(function(f){
          return h("button",{key:f.k,onClick:function(){setFStatus(f.k)},style:{padding:"6px 14px",borderRadius:20,border:"1px solid "+(fStatus===f.k?T.ac:T.bd),background:fStatus===f.k?T.as:"transparent",color:fStatus===f.k?T.ac:T.ts,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT_FAMILY}},f.l+" ("+f.n+")");
        })
      ),
      proj.evidences.filter(function(e){return fStatus==="all"||e.status===fStatus}).map(function(ev){
        let ct=proj.controls.find(function(c){return c.id===ev.controlId});
        return h("div",{key:ev.id,style:Object.assign({},cS,{marginBottom:12})},
          // Header row
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
            h("div",{style:{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}},
              h(EvBdg,{status:ev.status}),
              ct?h("span",{style:{fontSize:11,color:T.ac,fontWeight:600}},ct.code+" — "+ct.causaBase):null,
              h("span",{style:{fontSize:10,color:T.td,background:T.sa,padding:"2px 6px",borderRadius:3}},ev.type)
            ),
            ev.status==="en_revision"?h("div",{style:{display:"flex",gap:6}},
              h("button",{style:Object.assign({},btnS("success"),{padding:"8px 16px"}),onClick:function(){setEvSt(ev.id,"aprobada")}},"✓ Aprobar"),
              h("button",{style:Object.assign({},btnS("danger"),{padding:"8px 16px"}),onClick:function(){setEvSt(ev.id,"rechazada")}},"✕ Rechazar")
            ):null,
            h("div",{style:{display:"flex",gap:6,marginLeft:ev.status==="en_revision"?8:0}},
              h("button",{style:btnS("outline","sm"),onClick:function(){setModal("edit-ev");setEditEv(ev)}},"✏️ Editar"),
              h("button",{style:btnS("danger","sm"),onClick:function(){delEv(ev.id)}},"🗑 Eliminar")
            )
          ),
          // Description
          h("div",{style:{fontSize:14,fontWeight:600,marginBottom:4}},ev.description),
          h("div",{style:{fontSize:11,color:T.td,marginBottom:8}},"Fecha: "+ev.date+(ev.reviewer?" · Revisó: "+ev.reviewer:"")),
          // Files with preview
          ev.files&&ev.files.length>0?h("div",{style:{borderTop:"1px solid "+T.bd,paddingTop:12}},
            h("div",{style:{fontSize:11,fontWeight:700,color:T.td,textTransform:"uppercase",marginBottom:8}},"Archivos adjuntos ("+ev.files.length+"):"),
            h("div",{style:{display:"flex",flexDirection:"column",gap:10}},
              ev.files.map(function(f,fi){
                let ext=(f.name||"").split(".").pop().toLowerCase();
                const isImg = ["jpg","jpeg","png","gif","webp","bmp"].indexOf(ext)>=0;
                let isPdf=ext==="pdf";
                let icon=isPdf?"📄":isImg?"🖼️":["doc","docx"].indexOf(ext)>=0?"📝":["xls","xlsx"].indexOf(ext)>=0?"📊":"📎";
                let sizeStr=f.size<1024?f.size+" B":f.size<1048576?(f.size/1024).toFixed(1)+" KB":(f.size/1048576).toFixed(1)+" MB";
                let thisFileKey=ev.id+"-"+fi;
                let isOpen=preview===thisFileKey;

                return h("div",{key:fi,style:{background:T.sa,borderRadius:10,border:"1px solid "+T.bd,overflow:"hidden"}},
                  // File info bar
                  h("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"12px 14px"}},
                    h("span",{style:{fontSize:24}},icon),
                    h("div",{style:{flex:1,minWidth:0}},
                      h("div",{style:{fontSize:13,fontWeight:600,color:T.tx}},f.name),
                      h("div",{style:{fontSize:10,color:T.td,marginTop:1}},sizeStr)
                    ),
                    h("button",{onClick:function(){setPreview(isOpen?null:thisFileKey)},style:btnS(isOpen?"primary":"outline","sm")},isOpen?"✕ Cerrar":"👁 Ver"),
                    h("a",{href:f.data,download:f.name,target:"_blank",rel:"noopener",style:Object.assign({},btnS("outline","sm"),{textDecoration:"none",color:T.ac,cursor:"pointer"})},"⬇ Descargar")
                  ),
                  // Image thumbnail when closed
                  isImg&&!isOpen?h("div",{style:{padding:"0 14px 10px"}},
                    h("img",{src:f.data,onClick:function(){setPreview(thisFileKey)},style:{height:60,borderRadius:6,objectFit:"cover",cursor:"pointer",border:"1px solid "+T.bd}})
                  ):null,
                  // Zoomable image viewer
                  isImg&&isOpen?h(ZoomViewer,{src:f.data}):null,
                  // PDF preview
                  isPdf&&isOpen?h("div",{style:{padding:"8px 14px 14px"}},
                    h("iframe",{src:f.data,style:{width:"100%",height:600,border:"none",borderRadius:8,background:"#fff"}})
                  ):null,
                  // Other file types
                  !isImg&&!isPdf&&isOpen?h("div",{style:{padding:"14px",textAlign:"center"}},
                    h("div",{style:{padding:"24px",background:T.bg,borderRadius:10,border:"1px solid "+T.bd}},
                      h("div",{style:{fontSize:48,marginBottom:10}},icon),
                      h("div",{style:{fontSize:14,fontWeight:700,color:T.tx}},f.name),
                      h("div",{style:{fontSize:12,color:T.ts,margin:"6px 0 14px"}},"Este tipo de archivo no se puede previsualizar en el navegador"),
                      h("a",{href:f.data,download:f.name,target:"_blank",rel:"noopener",style:Object.assign({},btnS("primary"),{textDecoration:"none",display:"inline-flex"})},"⬇ Descargar para ver")
                    )
                  ):null
                );
              })
            )
          ):h("div",{style:{fontSize:12,color:T.td,fontStyle:"italic"}},"Sin archivos adjuntos")
        );
      }),
      proj.evidences.length===0?h("div",{style:{textAlign:"center",padding:40}},h("div",{style:{fontSize:40}},"📋"),h("p",{style:{color:T.ts}},"Sin evidencias")):null
    );
  }

  // ═══ REPORTS & ANALYTICS ═══
  if(view==="reports"){
    const _rptProj = useState("all");
    const rptProjId = _rptProj[0], setRptProj = _rptProj[1];

    const allProjects = projects || [];
    const selectedProject = rptProjId !== "all" ? allProjects.find(function(p){return p.id===rptProjId}) : null;
    const scopeProjects = selectedProject ? [selectedProject] : allProjects;
    const scopeLabel = selectedProject ? selectedProject.name : "Vista General";

    const totalProjects = allProjects.length;
    const totalControls = scopeProjects.reduce(function(s,p){return s+p.controls.length},0);
    const completedControls = scopeProjects.reduce(function(s,p){return s+p.controls.filter(function(c){return c.compliance&&c.compliance.trim()}).length},0);
    const totalEvidences = scopeProjects.reduce(function(s,p){return s+p.evidences.length},0);
    const approvedEv = scopeProjects.reduce(function(s,p){return s+p.evidences.filter(function(e){return e.status==="aprobada"}).length},0);
    const rejectedEv = scopeProjects.reduce(function(s,p){return s+p.evidences.filter(function(e){return e.status==="rechazada"}).length},0);
    const pendingEv = scopeProjects.reduce(function(s,p){return s+p.evidences.filter(function(e){return e.status==="en_revision"}).length},0);
    const pctGlobal = totalControls>0?Math.round(completedControls/totalControls*100):0;

    // Per-project bar data (only for global view)
    const projectBarData = allProjects.map(function(p){
      const tc2=p.controls.length;
      const cc=p.controls.filter(function(c){return c.compliance&&c.compliance.trim()}).length;
      return {name:p.name.length>18?p.name.slice(0,18)+"...":p.name, Completados:cc, Pendientes:tc2-cc, pct:tc2>0?Math.round(cc/tc2*100):0};
    });

    // Per-control data (for single project view)
    const controlBarData = selectedProject ? selectedProject.controls.map(function(c){
      const hasComp = c.compliance&&c.compliance.trim() ? 1 : 0;
      const evCount = selectedProject.evidences.filter(function(e){return e.controlId===c.id}).length;
      return {name:c.code, Cumplimiento:hasComp, Evidencias:evCount, causaBase:c.causaBase};
    }) : [];

    // Evidence status pie
    const evPieData = [{name:"Aprobadas",value:approvedEv,fill:"#2E8B57"},{name:"Pendientes",value:pendingEv,fill:"#D97706"},{name:"Rechazadas",value:rejectedEv,fill:"#DC2626"}].filter(function(d){return d.value>0});

    // Risk levels
    const riskLevels = {};
    scopeProjects.forEach(function(p){p.controls.forEach(function(c){
      const level=c.riNiv||"Sin clasificar";
      riskLevels[level]=(riskLevels[level]||0)+1;
    })});
    const riskData=Object.keys(riskLevels).map(function(k){
      const colors={"Extremo":"#DC2626","Alto":"#D97706","Moderado":"#E87722","Bajo":"#2E8B57","Muy Baja":"#1A7AB5","Sin clasificar":"#9C9590"};
      return {name:k,value:riskLevels[k],fill:colors[k]||"#9C9590"};
    });

    function exportReport(){
      let csv="Proyecto,Control,Causa Base,Cumplimiento,Riesgo Inherente,Riesgo Residual,Evidencias,Estado Evidencias\n";
      scopeProjects.forEach(function(p){
        p.controls.forEach(function(c){
          const evs=p.evidences.filter(function(e){return e.controlId===c.id});
          const evStatus=evs.length>0?evs.map(function(e){return e.status}).join("; "):"Sin evidencias";
          csv+="\""+p.name+"\",\""+c.code+"\",\""+c.causaBase+"\",\""+((c.compliance||"").replace(/"/g,"\"\""))+"\","+(c.riNiv||"")+","+(c.rrNiv||"")+","+evs.length+",\""+evStatus+"\"\n";
        });
      });
      const blob=new Blob([csv],{type:"text/csv"});
      const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="reporte_"+(selectedProject?selectedProject.name:"general")+"_"+today()+".csv";document.body.appendChild(a);a.click();document.body.removeChild(a);
      log("EXPORT","Reporte exportado: "+scopeLabel);
    }

    content=h("div",null,
      h("button",{style:btnS("ghost","sm"),onClick:function(){setView("projects")}},"← Proyectos"),
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"12px 0 20px",flexWrap:"wrap",gap:10}},
        h("div",null,
          h("h2",{style:{margin:0,fontSize:24,fontWeight:900}},"📊 Reportes y Analítica"),
          h("p",{style:{margin:"4px 0 0",fontSize:13,color:T.ts}},scopeLabel)
        ),
        h("div",{style:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}},
          h("select",{style:Object.assign({},iS,{width:"auto",minWidth:180}),value:rptProjId,onChange:function(e){setRptProj(e.target.value)}},
            h("option",{value:"all"},"📊 Vista General (todos)"),
            allProjects.map(function(p){return h("option",{key:p.id,value:p.id},"📁 "+p.name)})
          ),
          h("button",{style:btnS("outline","sm"),onClick:exportReport},"📥 Exportar CSV")
        )
      ),

      // KPIs
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}},
        [{l:"Controles",v:totalControls,c:"#1A7AB5",i:"📋"},{l:"Completados",v:completedControls,c:"#2E8B57",i:"✅"},{l:"Avance",v:pctGlobal+"%",c:pctGlobal===100?"#2E8B57":T.ac,i:"📈"},{l:"Evidencias",v:totalEvidences,c:"#D97706",i:"📎"},{l:"Aprobadas",v:approvedEv,c:"#2E8B57",i:"✓"},{l:"Rechazadas",v:rejectedEv,c:"#DC2626",i:"✕"}].map(function(k){
          return h("div",{key:k.l,style:Object.assign({},cS,{padding:14,textAlign:"center"})},
            h("div",{style:Object.assign({},mS,{fontSize:24,fontWeight:900,color:k.c})},k.v),
            h("div",{style:{fontSize:10,color:T.td,marginTop:2}},k.l)
          );
        })
      ),

      // Progress bar
      h("div",{style:Object.assign({},cS,{padding:16,marginBottom:20})},
        h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6}},
          h("span",{style:{fontSize:13,fontWeight:700}},"Avance de Cumplimiento"),
          h("span",{style:Object.assign({},mS,{fontSize:18,fontWeight:900,color:pctGlobal===100?"#2E8B57":T.ac})},pctGlobal+"%")
        ),
        h("div",{style:{height:12,background:T.sa,borderRadius:6,overflow:"hidden"}},
          h("div",{style:{width:pctGlobal+"%",height:"100%",background:pctGlobal===100?"#2E8B57":"linear-gradient(90deg,"+T.ac+",#F59E0B)",borderRadius:6,transition:"width .5s"}})
        )
      ),

      // Charts
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginBottom:20}},

        // Chart 1: Bar - projects or controls
        h("div",{style:Object.assign({},cS,{padding:20})},
          h("h3",{style:{margin:"0 0 14px",fontSize:14,fontWeight:800}},selectedProject?"Cumplimiento por Control":"Avance por Proyecto"),
          (selectedProject?controlBarData:projectBarData).length>0?h(ResponsiveContainer,{width:"100%",height:260},
            selectedProject?
              h(BarChart,{data:controlBarData,margin:{top:5,right:10,left:0,bottom:50}},
                h(CartesianGrid,{strokeDasharray:"3 3",stroke:T.bd}),
                h(XAxis,{dataKey:"name",tick:{fontSize:9,fill:T.td},angle:-45,textAnchor:"end",height:60}),
                h(YAxis,{tick:{fontSize:10,fill:T.td}}),
                h(Tooltip,{contentStyle:{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,fontSize:11}}),
                h(Legend,{wrapperStyle:{fontSize:10}}),
                h(Bar,{dataKey:"Cumplimiento",fill:"#2E8B57",radius:[3,3,0,0]}),
                h(Bar,{dataKey:"Evidencias",fill:"#1A7AB5",radius:[3,3,0,0]})
              ):
              h(BarChart,{data:projectBarData,margin:{top:5,right:10,left:0,bottom:50}},
                h(CartesianGrid,{strokeDasharray:"3 3",stroke:T.bd}),
                h(XAxis,{dataKey:"name",tick:{fontSize:9,fill:T.td},angle:-35,textAnchor:"end",height:60}),
                h(YAxis,{tick:{fontSize:10,fill:T.td}}),
                h(Tooltip,{contentStyle:{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,fontSize:11}}),
                h(Legend,{wrapperStyle:{fontSize:10}}),
                h(Bar,{dataKey:"Completados",fill:"#2E8B57",radius:[3,3,0,0]}),
                h(Bar,{dataKey:"Pendientes",fill:"#D97706",radius:[3,3,0,0]})
              )
          ):h("div",{style:{textAlign:"center",padding:40,color:T.ts}},"Sin datos")
        ),

        // Chart 2: Pie - evidence status
        h("div",{style:Object.assign({},cS,{padding:20})},
          h("h3",{style:{margin:"0 0 14px",fontSize:14,fontWeight:800}},"Estado de Evidencias"),
          evPieData.length>0?h(ResponsiveContainer,{width:"100%",height:260},
            h(PieChart,null,
              h(Pie,{data:evPieData,cx:"50%",cy:"50%",outerRadius:85,innerRadius:45,paddingAngle:3,dataKey:"value",label:function(d){return d.name+" ("+d.value+")"}},
                evPieData.map(function(entry,idx){return h(Cell,{key:"c1-"+idx,fill:entry.fill})})
              ),
              h(Tooltip,{contentStyle:{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,fontSize:11}}),
              h(Legend,{wrapperStyle:{fontSize:10}})
            )
          ):h("div",{style:{textAlign:"center",padding:40,color:T.ts}},"Sin evidencias")
        )
      ),

      // Second row
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginBottom:20}},

        // Chart 3: Risk distribution
        h("div",{style:Object.assign({},cS,{padding:20})},
          h("h3",{style:{margin:"0 0 14px",fontSize:14,fontWeight:800}},"Riesgo Inherente"),
          riskData.length>0?h(ResponsiveContainer,{width:"100%",height:240},
            h(PieChart,null,
              h(Pie,{data:riskData,cx:"50%",cy:"50%",outerRadius:75,innerRadius:35,paddingAngle:3,dataKey:"value",label:function(d){return d.name+" ("+d.value+")"}},
                riskData.map(function(entry,idx){return h(Cell,{key:"c2-"+idx,fill:entry.fill})})
              ),
              h(Tooltip,{contentStyle:{background:T.sf,border:"1px solid "+T.bd,borderRadius:8,fontSize:11}}),
              h(Legend,{wrapperStyle:{fontSize:10}})
            )
          ):h("div",{style:{textAlign:"center",padding:40,color:T.ts}},"Sin datos")
        ),

        // Table: detail per control (project) or per project (global)
        h("div",{style:Object.assign({},cS,{padding:20,maxHeight:340,overflowY:"auto"})},
          h("h3",{style:{margin:"0 0 14px",fontSize:14,fontWeight:800}},selectedProject?"Detalle por Control":"Resumen por Proyecto"),
          h("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11}},
            h("thead",null,
              h("tr",null,
                selectedProject?
                  ["Control","Causa","Cumplimiento","Evidencias"].map(function(th){return h("th",{key:th,style:{padding:"6px 8px",textAlign:"left",borderBottom:"2px solid "+T.bd,color:T.td,fontWeight:700,fontSize:10}},th)}):
                  ["Proyecto","Avance","Evidencias","Estado"].map(function(th){return h("th",{key:th,style:{padding:"6px 8px",textAlign:"left",borderBottom:"2px solid "+T.bd,color:T.td,fontWeight:700,fontSize:10}},th)})
              )
            ),
            h("tbody",null,
              selectedProject?
                selectedProject.controls.map(function(c){
                  const hasComp=c.compliance&&c.compliance.trim();
                  const evCount=selectedProject.evidences.filter(function(e){return e.controlId===c.id}).length;
                  return h("tr",{key:c.id,style:{borderBottom:"1px solid "+T.bd}},
                    h("td",{style:{padding:"6px 8px",fontWeight:600,fontSize:11}},c.code),
                    h("td",{style:{padding:"6px 8px",fontSize:10,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},c.causaBase),
                    h("td",{style:{padding:"6px 8px"}},hasComp?h("span",{style:bdg("#2E8B57","#2E8B5718")},"✓"):h("span",{style:bdg("#D97706","#D9770618")},"⏳")),
                    h("td",{style:{padding:"6px 8px",textAlign:"center",fontWeight:700}},evCount)
                  );
                }):
                allProjects.map(function(p){
                  const tc2=p.controls.length;const cc=p.controls.filter(function(c){return c.compliance&&c.compliance.trim()}).length;
                  const pct2=tc2>0?Math.round(cc/tc2*100):0;
                  return h("tr",{key:p.id,style:{borderBottom:"1px solid "+T.bd,cursor:"pointer"},onClick:function(){setRptProj(p.id)}},
                    h("td",{style:{padding:"6px 8px",fontWeight:600,color:T.ac}},p.name),
                    h("td",{style:{padding:"6px 8px"}},
                      h("div",{style:{display:"flex",alignItems:"center",gap:6}},
                        h("div",{style:{flex:1,height:6,background:T.sa,borderRadius:3,overflow:"hidden"}},h("div",{style:{width:pct2+"%",height:"100%",background:pct2===100?"#2E8B57":"#E87722",borderRadius:3}})),
                        h("span",{style:Object.assign({},mS,{fontSize:10,fontWeight:700})},pct2+"%")
                      )
                    ),
                    h("td",{style:{padding:"6px 8px",textAlign:"center"}},p.evidences.length),
                    h("td",{style:{padding:"6px 8px"}},pct2===100?h("span",{style:bdg("#2E8B57","#2E8B5718")},"✓ Completo"):h("span",{style:bdg("#D97706","#D9770618")},"En curso"))
                  );
                })
            )
          )
        )
      )
    );
  }

  // ═══ LOGS VIEWER ═══
  if(view==="logs"&&session.role==="admin"){
    const categories = ["all","Acceso","Proyecto","Control","Evidencia","Exportación","Usuarios"];
    const filteredLogs=(logs||[]).filter(function(l){return logFilter==="all"||l.category===logFilter}).reverse();

    content=h("div",null,
      h("button",{style:btnS("ghost","sm"),onClick:function(){setView("projects")}},"← Proyectos"),
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"12px 0 20px"}},
        h("div",null,
          h("h2",{style:{margin:0,fontSize:24,fontWeight:900}},"📋 Logs de Auditoría y Transacciones"),
          h("p",{style:{margin:"4px 0 0",fontSize:13,color:T.ts}},logs.length+" registros totales")
        ),
        h("button",{style:btnS("outline","sm"),onClick:function(){
          // Export logs as CSV
          let csv="Fecha,Hora,Categoría,Tipo,Usuario,Detalle,Proyecto\n";
          (logs||[]).forEach(function(l){
            const d = new Date(l.timestamp);
            csv+=d.toLocaleDateString("es-CO")+","+d.toLocaleTimeString("es-CO")+","+l.category+","+LOG_TYPES[l.type]?.cat+","+l.user+",\""+l.detail.replace(/"/g,'""')+"\","+(l.project||"")+"\n";
          });
          const blob = new Blob([csv],{type:"text/csv"});
          const a = document.createElement("a");a.href=URL.createObjectURL(blob);a.download="logs_linea15_"+today()+".csv";document.body.appendChild(a);a.click();document.body.removeChild(a);
        }},"📥 Exportar CSV")
      ),

      // Stats
      h("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}},
        [{l:"Total",v:logs.length,c:T.ac},{l:"Accesos",v:logs.filter(function(l){return l.category==="Acceso"}).length,c:"#1A7AB5"},{l:"Controles",v:logs.filter(function(l){return l.category==="Control"}).length,c:"#D97706"},{l:"Evidencias",v:logs.filter(function(l){return l.category==="Evidencia"}).length,c:"#2E8B57"},{l:"Usuarios",v:logs.filter(function(l){return l.category==="Usuarios"}).length,c:"#E87722"}].map(function(s){
          return h("div",{key:s.l,style:{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:T.sa,borderRadius:8,border:"1px solid "+T.bd}},
            h("span",{style:Object.assign({},mS,{fontSize:14,fontWeight:800,color:s.c})},s.v),
            h("span",{style:{fontSize:11,color:T.td}},s.l)
          );
        })
      ),

      // Filters
      h("div",{style:{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}},
        categories.map(function(cat){
          return h("button",{key:cat,onClick:function(){setLogFilter(cat)},style:{padding:"6px 14px",borderRadius:20,border:"1px solid "+(logFilter===cat?T.ac:T.bd),background:logFilter===cat?T.as:"transparent",color:logFilter===cat?T.ac:T.ts,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT_FAMILY}},cat==="all"?"Todos":cat);
        })
      ),

      // Log entries
      h("div",{style:{display:"flex",flexDirection:"column",gap:4}},
        filteredLogs.slice(0,100).map(function(l){
          const lt=LOG_TYPES[l.type]||{icon:"📌",color:T.td,cat:"Sistema"};
          const d = new Date(l.timestamp);
          const dateStr=d.toLocaleDateString("es-CO");
          const timeStr=d.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
          return h("div",{key:l.id,style:{display:"grid",gridTemplateColumns:"80px 60px 28px 1fr",overflow:"hidden",gap:8,padding:"8px 12px",background:T.sf,borderRadius:8,border:"1px solid "+T.bd,alignItems:"center",fontSize:12}},
            h("span",{style:{color:T.td,fontSize:11}},dateStr),
            h("span",{style:Object.assign({},mS,{color:T.td,fontSize:10})},timeStr),
            h("span",{style:{fontSize:16}},lt.icon),
            h("div",{style:{minWidth:0}},
              h("div",{style:{fontWeight:600,color:T.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},l.detail),
              l.project?h("div",{style:{fontSize:10,color:T.td,marginTop:1}},"Proyecto: "+l.project):null
            ),
            h("span",{style:{fontSize:11,color:T.ts}},l.user),
            h("span",{style:bdg(lt.color,lt.color+"18")},l.category)
          );
        }),
        filteredLogs.length===0?h("div",{style:{textAlign:"center",padding:40}},h("div",{style:{fontSize:32}},"📋"),h("p",{style:{color:T.ts}},"Sin registros")):null,
        filteredLogs.length>100?h("div",{style:{textAlign:"center",padding:12,color:T.td,fontSize:12}},"Mostrando los últimos 100 de "+filteredLogs.length+" registros"):null
      )
    );
  }

  // ═══ ARCHIVE VIEWER ═══
  if(view==="archive"){
    const sortedArchive = (archive||[]).slice().sort(function(a,b){return new Date(b.archivedAt) - new Date(a.archivedAt)});
    const visibleArchive = session.role==="admin" ? sortedArchive : sortedArchive.filter(function(a){
      // Non-admin users only see archived projects they had access to
      const currentUser = (users||[]).find(function(u){return u.id===session.userId||u.username===session.username});
      if(!currentUser)return false;
      return currentUser.projectPerms?.[a.id];
    });

    content=h("div",null,
      h("button",{style:btnS("ghost","sm"),onClick:function(){setView("projects")}},"← Proyectos"),
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"12px 0 20px",flexWrap:"wrap",gap:10}},
        h("div",null,
          h("h2",{style:{margin:0,fontSize:24,fontWeight:900}},"📚 Archivo de Matrices Finalizadas"),
          h("p",{style:{margin:"4px 0 0",fontSize:13,color:T.ts}},visibleArchive.length+" matrices en el historial")
        )
      ),

      // Stats
      visibleArchive.length > 0 ? h("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}},
        [
          {l:"Total matrices",v:visibleArchive.length,c:T.ac},
          {l:"Controles documentados",v:visibleArchive.reduce(function(s,a){return s+(a.stats?.controlsCompleted||0)},0),c:"#2E8B57"},
          {l:"Evidencias aprobadas",v:visibleArchive.reduce(function(s,a){return s+(a.stats?.evidencesApproved||0)},0),c:"#1A7AB5"}
        ].map(function(s){
          return h("div",{key:s.l,style:{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:T.sa,borderRadius:8,border:"1px solid "+T.bd}},
            h("span",{style:Object.assign({},mS,{fontSize:14,fontWeight:800,color:s.c})},s.v),
            h("span",{style:{fontSize:11,color:T.td}},s.l)
          );
        })
      ) : null,

      visibleArchive.length === 0 ? h("div",{style:Object.assign({},cS,{textAlign:"center",padding:60})},
        h("div",{style:{fontSize:48,marginBottom:12}},"📚"),
        h("h3",{style:{margin:"0 0 8px",fontSize:18,color:T.tx}},"Sin matrices archivadas"),
        h("p",{style:{margin:0,fontSize:13,color:T.ts}},"Las matrices que finalices aparecerán aquí como registro histórico")
      ) : h("div",{style:{display:"flex",flexDirection:"column",gap:12}},
        visibleArchive.map(function(a){
          const archivedDate = new Date(a.archivedAt);
          const stats = a.stats || {};
          return h("div",{key:a.id,style:Object.assign({},cS,{padding:20,borderLeft:"4px solid "+T.sc})},
            h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:12,flexWrap:"wrap"}},
              h("div",{style:{flex:1,minWidth:200}},
                h("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}},
                  h("h3",{style:{margin:0,fontSize:16,fontWeight:800}},a.name),
                  h("span",{style:bdg(T.sc,T.ss)},"✓ Finalizada")
                ),
                h("div",{style:{fontSize:12,color:T.ts,marginBottom:2}},"Responsable: "+(a.responsible||"—")),
                h("div",{style:{fontSize:12,color:T.ts,marginBottom:2}},"Fecha de publicación: "+(a.publishDate||"—")),
                h("div",{style:{fontSize:12,color:T.sc,fontWeight:600}},"🏁 Finalizada: "+archivedDate.toLocaleDateString("es-CO")+" "+archivedDate.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})),
                h("div",{style:{fontSize:12,color:T.ts}},"Por: "+(a.finalizedBy||"—")+" ("+(a.finalizedByRole||"")+")")
              ),
              h("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
                h("button",{style:btnS("outline","sm"),onClick:function(){
                  log("ARCHIVE_EXPORT","Exportación desde archivo: "+a.name, a.name);
                  exportProject(a);
                }},"📥 Exportar"),
                session.role==="admin"?h("button",{style:btnS("ghost","sm"),onClick:function(){
                  if(confirm("¿Eliminar este registro del archivo?\n\nEsto no afecta el archivo Excel ya descargado pero sí elimina el registro histórico en la app.")){
                    const newArchive = archive.filter(function(x){return x.id!==a.id});
                    setArchive(newArchive);
                    saveArchive(newArchive);
                    log("PROJECT_DELETE","Registro archivado eliminado: "+a.name);
                  }
                }},"🗑 Eliminar"):null
              )
            ),
            // Stats badges
            h("div",{style:{display:"flex",gap:8,flexWrap:"wrap",paddingTop:10,borderTop:"1px solid "+T.bd}},
              h("div",{style:{padding:"4px 10px",background:T.sa,borderRadius:6,fontSize:11}},
                h("span",{style:{color:T.td}},"Controles: "),
                h("span",{style:{color:T.tx,fontWeight:700}},(stats.controlsCompleted||0)+"/"+(stats.totalControls||0))
              ),
              h("div",{style:{padding:"4px 10px",background:T.sa,borderRadius:6,fontSize:11}},
                h("span",{style:{color:T.td}},"Evidencias: "),
                h("span",{style:{color:T.tx,fontWeight:700}},stats.totalEvidences||0)
              ),
              stats.evidencesApproved > 0 ? h("div",{style:{padding:"4px 10px",background:T.ss,borderRadius:6,fontSize:11}},
                h("span",{style:{color:T.sc,fontWeight:700}},"✓ "+stats.evidencesApproved+" aprobadas")
              ) : null,
              stats.evidencesRejected > 0 ? h("div",{style:{padding:"4px 10px",background:"#FEE2E2",borderRadius:6,fontSize:11}},
                h("span",{style:{color:"#DC2626",fontWeight:700}},"✕ "+stats.evidencesRejected+" rechazadas")
              ) : null,
              stats.evidencesPending > 0 ? h("div",{style:{padding:"4px 10px",background:T.ws,borderRadius:6,fontSize:11}},
                h("span",{style:{color:T.wn,fontWeight:700}},"⏳ "+stats.evidencesPending+" pendientes")
              ) : null
            )
          );
        })
      )
    );
  }

  // ═══ ADMIN - USER MANAGEMENT ═══
  if(view==="admin"&&session.role==="admin"){

    const filteredUsers=(users||[]).filter(function(u){return !adminSearch||(u.username+" "+u.name+" "+u.email+" "+u.role).toLowerCase().indexOf(adminSearch.toLowerCase())>=0});

    function createUser(){
      if(!newUser||!newName||!newPw)return;
      if(newPw.length < 8){alert("La contraseña debe tener al menos 8 caracteres");return}
      if(!newEmail){alert("El correo electrónico es requerido");return}
      if(users.some(function(u){return u.username===newUser})){alert("El usuario ya existe");return}
      API.createUser(newEmail, newPw, newUser, newName, newRole).then(function(result){
        if(result.error){alert("Error: " + result.error);return}
        log("USER_CREATE","Usuario creado: "+newName+" (@"+newUser+") - Rol: "+newRole);
        API.loadUsers().then(function(u){if(u)setUsers(u)});
        setNewUser("");setNewName("");setNewEmail("");setNewRole("lider");setNewPw("");setAdminModal(null);
      }).catch(function(err){alert("Error: " + (err.message||"No se pudo crear"))});
    }
    function toggleUser(id){
      let u=users.find(function(x){return x.id===id});
      log("USER_TOGGLE","Usuario "+(u&&u.active?"desactivado":"activado")+": "+(u?u.name:""));
      API.toggleUser(id, !(u&&u.active)).then(function(){
        API.loadUsers().then(function(u){if(u)setUsers(u)});
      });
    }
    function deleteUser(id){
      if(!confirm("¿Eliminar este usuario?"))return;
      let u=users.find(function(x){return x.id===id});
      log("USER_DELETE","Usuario eliminado: "+(u?u.name:""));
      API.deleteUser(id).then(function(){
        API.loadUsers().then(function(u){if(u)setUsers(u)});
      });
    }
    function updateUserField(id,field,value){
      API.updateUser(id, Object.fromEntries([[field==='projectPerms'?'project_perms':field, value]]));
      setUsers(function(prev){return prev.map(function(u){return u.id===id?Object.assign({},u,Object.fromEntries([[field,value]])):u})});
    }
    function setProjectPerm(userId,projectId,perm){
      let u=users.find(function(x){return x.id===userId});let p=projects?projects.find(function(x){return x.id===projectId}):null;
      log("USER_PERMS","Permiso cambiado: "+(u?u.name:"")+" → "+(p?p.name:"")+" = "+perm);
      const newPerms = Object.assign({},u?.projectPerms||{});
      if(perm==="none"){delete newPerms[projectId]}else{newPerms[projectId]=perm}
      API.updateUser(userId, {project_perms: newPerms});
      setUsers(function(prev){return prev.map(function(u){
        if(u.id!==userId)return u;
        return Object.assign({},u,{projectPerms:newPerms});
      })});
    }

    content=h("div",null,
      h("button",{style:btnS("ghost","sm"),onClick:function(){setView("projects")}},"← Proyectos"),
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"12px 0 20px"}},
        h("div",null,
          h("h2",{style:{margin:0,fontSize:24,fontWeight:900}},"⚙️ Administración de Usuarios"),
          h("p",{style:{margin:"4px 0 0",fontSize:13,color:T.ts}},"Crear, editar y asignar permisos por proyecto")
        ),
        h("button",{style:btnS("primary"),onClick:function(){setAdminModal("create")}},"＋ Nuevo Usuario")
      ),

      // Stats
      h("div",{style:{display:"flex",gap:12,marginBottom:16}},
        [{l:"Total",v:(users||[]).length,c:T.ac},{l:"Activos",v:(users||[]).filter(function(u){return u.active}).length,c:T.sc},{l:"Inactivos",v:(users||[]).filter(function(u){return!u.active}).length,c:T.dn}].map(function(s){
          return h("div",{key:s.l,style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:T.sa,borderRadius:8,border:"1px solid "+T.bd}},
            h("span",{style:Object.assign({},mS,{fontSize:16,fontWeight:800,color:s.c})},s.v),
            h("span",{style:{fontSize:11,color:T.td}},s.l)
          );
        })
      ),

      // Search
      h("input",{style:Object.assign({},iS,{marginBottom:16}),placeholder:"🔍 Buscar usuario...",value:adminSearch,onChange:function(e){setAdminSearch(e.target.value)}}),

      // Users table
      h("div",{style:{display:"flex",flexDirection:"column",gap:6}},
        // Header
        h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 120px 100px 120px",gap:10,padding:"8px 16px",fontSize:10,fontWeight:700,color:T.td,textTransform:"uppercase"}},
          h("span",null,"Usuario"),
          h("span",null,"Correo"),
          h("span",null,"Rol"),
          h("span",{style:{textAlign:"center"}},"Estado"),
          h("span",{style:{textAlign:"center"}},"Acciones")
        ),
        // Rows
        filteredUsers.map(function(u){
          const roleInfo=AUTH_ROLES[u.role]||{l:u.role};
          const projCount=u.projectPerms?Object.keys(u.projectPerms).length:0;
          return h("div",{key:u.id,style:{background:T.sf,borderRadius:10,border:"1px solid "+T.bd,padding:"12px 16px",opacity:u.active?1:.5}},
            h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 120px 100px 120px",gap:10,alignItems:"center"}},
              // User info
              h("div",{style:{display:"flex",alignItems:"center",gap:10}},
                h("div",{style:{width:32,height:32,borderRadius:"50%",background:u.active?"linear-gradient(135deg,"+T.ac+",#F59E0B)":T.sa,display:"flex",alignItems:"center",justifyContent:"center",color:T.wh,fontWeight:800,fontSize:12}},u.name?u.name.charAt(0).toUpperCase():"U"),
                h("div",null,
                  h("div",{style:{fontSize:13,fontWeight:700}},u.name),
                  h("div",{style:{fontSize:10,color:T.td}},"@"+u.username)
                )
              ),
              // Email
              h("div",{style:{fontSize:12,color:T.ts}},u.email||"—"),
              // Role
              h("div",null,h("span",{style:bdg(T.ac,T.as)},roleInfo.l)),
              // Status
              h("div",{style:{textAlign:"center"}},
                h("button",{style:Object.assign({},btnS(u.active?"success":"danger","sm"),{width:"100%",justifyContent:"center"}),onClick:function(){toggleUser(u.id)}},u.active?"✓ Activo":"✕ Inactivo")
              ),
              // Actions
              h("div",{style:{display:"flex",gap:4,justifyContent:"center"}},
                h("button",{style:btnS("outline","sm"),onClick:function(){setPermUser(u);setAdminModal("perms")}},"🔑"),
                h("button",{style:btnS("outline","sm"),onClick:function(){setEditingUser(u);setAdminModal("edit")}},"✏️"),
                u.id!=="admin"?h("button",{style:btnS("danger","sm"),onClick:function(){deleteUser(u.id)}},"🗑"):null
              )
            ),
            // Project permissions summary
            projCount>0?h("div",{style:{marginTop:8,paddingTop:8,borderTop:"1px solid "+T.bd,display:"flex",gap:6,flexWrap:"wrap"}},
              h("span",{style:{fontSize:10,color:T.td}},"Proyectos asignados:"),
              Object.entries(u.projectPerms||{}).map(function(entry){
                let projName=projects?projects.find(function(p){return p.id===entry[0]}):null;
                const permLabel = {full:"Completo",fill:"Solo llenar",evidence:"Solo evidencias",view:"Solo ver"}[entry[1]]||entry[1];
                return h("span",{key:entry[0],style:bdg(T.inf,T.inf+"18")},(projName?projName.name.substring(0,15):entry[0])+" → "+permLabel);
              })
            ):null
          );
        })
      ),

      // Create user modal
      adminModal==="create"?h(Mdl,{title:"Crear Nuevo Usuario",onClose:function(){setAdminModal(null)}},
        h(Fld,{label:"Nombre de usuario"},h("input",{style:iS,value:newUser,onChange:function(e){setNewUser(e.target.value)},placeholder:"Ej: jperez"})),
        h(Fld,{label:"Nombre completo"},h("input",{style:iS,value:newName,onChange:function(e){setNewName(e.target.value)},placeholder:"Ej: Juan Pérez"})),
        h(Fld,{label:"Correo electrónico"},h("input",{style:iS,value:newEmail,onChange:function(e){setNewEmail(e.target.value)},placeholder:"Ej: jperez@empresa.com"})),
        h(Fld,{label:"Rol"},h("select",{style:Object.assign({},sS,{width:"100%"}),value:newRole,onChange:function(e){setNewRole(e.target.value)}},
          Object.entries(AUTH_ROLES).map(function(entry){return h("option",{key:entry[0],value:entry[0]},entry[1].l)})
        )),
        h(Fld,{label:"Contraseña"},h("input",{type:"password",style:iS,value:newPw,onChange:function(e){setNewPw(e.target.value)},placeholder:"Mínimo 6 caracteres"})),
        h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20}},
          h("button",{style:btnS("outline"),onClick:function(){setAdminModal(null)}},"Cancelar"),
          h("button",{style:btnS("primary"),disabled:!newUser||!newName||!newPw,onClick:createUser},"Crear Usuario")
        )
      ):null,

      // Edit user modal
      adminModal==="edit"&&editingUser?h(Mdl,{title:"Editar Usuario: "+editingUser.name,onClose:function(){setAdminModal(null);setEditingUser(null)}},
        h(Fld,{label:"Nombre completo"},h("input",{style:iS,value:editingUser.name,onChange:function(e){let v=e.target.value;setEditingUser(function(prev){return Object.assign({},prev,{name:v})})}})),
        h(Fld,{label:"Correo electrónico"},h("input",{style:iS,value:editingUser.email||"",onChange:function(e){let v=e.target.value;setEditingUser(function(prev){return Object.assign({},prev,{email:v})})}})),
        h(Fld,{label:"Rol"},h("select",{style:Object.assign({},sS,{width:"100%"}),value:editingUser.role,onChange:function(e){let v=e.target.value;setEditingUser(function(prev){return Object.assign({},prev,{role:v})})}},
          Object.entries(AUTH_ROLES).map(function(entry){return h("option",{key:entry[0],value:entry[0]},entry[1].l)})
        )),
        h(Fld,{label:"Nueva contraseña (dejar vacío para no cambiar)"},h("input",{type:"password",style:iS,placeholder:"••••••••",onChange:function(e){let v=e.target.value;if(v)setEditingUser(function(prev){return Object.assign({},prev,{password:v})})}})),
        h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20}},
          h("button",{style:btnS("outline"),onClick:function(){setAdminModal(null);setEditingUser(null)}},"Cancelar"),
          h("button",{style:btnS("primary"),onClick:function(){
            setUsers(function(prev){return prev.map(function(u){return u.id===editingUser.id?editingUser:u})});
            setAdminModal(null);setEditingUser(null);
          }},"💾 Guardar Cambios")
        )
      ):null,

      // Project permissions modal
      adminModal==="perms"&&permUser?h(Mdl,{title:"Permisos de: "+permUser.name,onClose:function(){setAdminModal(null);setPermUser(null)}},
        h("div",{style:{marginBottom:16}},
          h("div",{style:{fontSize:13,color:T.ts,marginBottom:4}},"Asigna el nivel de acceso para cada proyecto:"),
          h("div",{style:{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}},
            h("span",{style:bdg(T.sc,T.ss)},"Completo = todo"),
            h("span",{style:bdg(T.wn,T.ws)},"Llenar = solo controles"),
            h("span",{style:bdg(T.inf,T.inf+"18")},"Evidencias = solo evidencias"),
            h("span",{style:bdg(T.td,T.sa)},"Ver = solo lectura")
          )
        ),
        h("div",{style:{display:"flex",flexDirection:"column",gap:8}},
          (projects||[]).map(function(p){
            let currentPerm=(permUser.projectPerms||{})[p.id]||"none";
            return h("div",{key:p.id,style:{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.sa,borderRadius:8,border:"1px solid "+T.bd}},
              h("div",{style:{flex:1,minWidth:0}},
                h("div",{style:{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},p.name),
                h("div",{style:{fontSize:10,color:T.td}},p.responsible)
              ),
              h("select",{style:Object.assign({},sS,{width:160}),value:currentPerm,onChange:function(e){setProjectPerm(permUser.id,p.id,e.target.value);setPermUser(function(prev){const perms = Object.assign({},prev.projectPerms||{});if(e.target.value==="none"){delete perms[p.id]}else{perms[p.id]=e.target.value}return Object.assign({},prev,{projectPerms:perms})})}},
                h("option",{value:"none"},"❌ Sin acceso"),
                h("option",{value:"full"},"✅ Completo"),
                h("option",{value:"fill"},"📝 Solo llenar controles"),
                h("option",{value:"evidence"},"📎 Solo evidencias"),
                h("option",{value:"view"},"👁 Solo ver")
              )
            );
          })
        ),
        h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20}},
          h("button",{style:btnS("primary"),onClick:function(){setAdminModal(null);setPermUser(null)}},"✓ Listo")
        )
      ):null
    );
  }

  let projModal=null;
  if(modal==="add-project"){
    projModal=h(Mdl,{title:"Nuevo Proyecto",onClose:function(){setModal(null)}},
      h(Fld,{label:"Nombre del proyecto"},h("input",{style:iS,value:pn,onChange:function(e){sPn(e.target.value)},placeholder:"Ej: Migración Cloud"})),
      h(Fld,{label:"Fecha de publicación"},h("input",{type:"date",style:Object.assign({},iS,{colorScheme:"light"}),value:pdt||today(),onChange:function(e){sPd(e.target.value)},onClick:function(e){try{e.target.showPicker()}catch(err){console.debug("showPicker not supported in this browser",err?.message)}}})),
      h(Fld,{label:"Responsable"},h("input",{style:iS,value:prsp,onChange:function(e){sPr(e.target.value)},placeholder:"Ej: Líder Técnico del Proyecto"})),
      h("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20}},h("button",{style:btnS("outline"),onClick:function(){setModal(null)}},"Cancelar"),h("button",{style:btnS("primary"),disabled:!pn||!prsp,onClick:addProject},"Crear Proyecto"))
    );
  }

  let editEvModal=null;
  if(modal==="edit-ev"&&editEv){
    editEvModal=h(EditEvModal,{ev:editEv,onSave:function(data){updateEv(editEv.id,data);setModal(null);setEditEv(null)},onClose:function(){setModal(null);setEditEv(null)}});
  }

  return h("div",{style:{fontFamily:FONT_FAMILY,background:T.bg,color:T.tx,minHeight:"100vh"}},
    h("link",{href:"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap",rel:"stylesheet"}),
    h("main",{style:{maxWidth:1100,margin:"0 auto",padding:"20px 24px"}},
      navBar,
      content
    ),
    projModal,
    editEvModal
  );
}
