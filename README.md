# iBanda - Digital Music Arquival

iBanda is a web application that implements a digital repository containing various music works and the respective scores. This repository was built within the structure of the OAIS (Open Archival Information System).

As stated in the reference model of OAIS, there needs to be a **Producer**, an **Administrator** and a **Consumer**. In this case, the **Producer** will <u>deposit music scores or catalog music works</u>. The **Consumer** will be the user that access the platform with the purpose of <u>consulting, searching and downloading available information</u>. The **Administrator** will, as the name sugests, <u>administrate the system</u>.

There are 3 main functional processes:

- **Ingestion**
  
  Receives or deposits files to store.

- **Administration**
  
  Organizes all form of data stored in the system.

- **Dissemination**
  
  Allows the distribution of all the stored objects. It can be made available as a ZIP file, or it can generate a static website that allows the navigation through the information.

There are a couple of rules when it comes to uploading files. To understand more about that, read ["docs/enunciado-pri2018.pdf"](https://github.com/MGCSousa/iBanda/blob/master/doc/enunciado-pri2018.pdf).

## Installation

1. Start MongoDB
   
   1. The databate will be called "iBanda"

2. Start Server (Node.js)
   
   1. Navigate to "src/iBanda"
      
      ```bash
      cd src/iBanda
      ```
   
   2. Install all components
      
      ```bash
      npm install
      ```
   
   3. Start server: http://localhost:2727
      
      ```bash
      npm start
      ```

3. Access "localhost" to view login page

&nbsp;

### Authors

- [Manuel Sousa](https://github.com/MGCSousa)

- [Eduardo Gil Rocha](https://github.com/egrocha)

- [Lázaro Vinícius](https://github.com/lazavini)

&nbsp;

*University Project - Processamento e Representação de Informação, Universidade do Minho (2018-2019)*
