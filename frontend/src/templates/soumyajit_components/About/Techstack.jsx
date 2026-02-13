import React from "react";
import { Col, Row } from "react-bootstrap";
import { SiNextdotjs, SiSolidity } from "react-icons/si";
import { FaRust } from "react-icons/fa";
import Go from "../../soumyajit_assets/TechIcons/go.svg";
import C from "../../soumyajit_assets/TechIcons/C++.svg";
import Javascript from "../../soumyajit_assets/TechIcons/Javascript.svg";
import Node from "../../soumyajit_assets/TechIcons/Node.svg";
import ReactIcon from "../../soumyajit_assets/TechIcons/React.svg";
import HaskellIcon from "../../soumyajit_assets/TechIcons/Haskell.svg";
import Java from "../../soumyajit_assets/TechIcons/Java.svg";
import Python from "../../soumyajit_assets/TechIcons/Python.svg";
import Typescript from "../../soumyajit_assets/TechIcons/Typescript.svg";
import Git from "../../soumyajit_assets/TechIcons/Git.svg";
import Firebase from "../../soumyajit_assets/TechIcons/Firebase.svg";
import Redis from "../../soumyajit_assets/TechIcons/Redis.svg";
import Docker from "../../soumyajit_assets/TechIcons/Docker.svg";
import Mongo from "../../soumyajit_assets/TechIcons/Mongo.svg";
import SQL from "../../soumyajit_assets/TechIcons/SQL.svg";
import Kubernates from "../../soumyajit_assets/TechIcons/Kubernates.svg";
import Redux from "../../soumyajit_assets/TechIcons/Redux.svg";
import Tailwind from "../../soumyajit_assets/TechIcons/Tailwind.svg";
import MUI from "../../soumyajit_assets/TechIcons/MUI.svg";
import Postman from "../../soumyajit_assets/TechIcons/Postman.svg";
import AWS from "../../soumyajit_assets/TechIcons/AWS.svg";
import Kafka from "../../soumyajit_assets/TechIcons/Kafka.svg";

function Techstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons">
        <img src={C} alt="C++" />
        <div className="tech-icons-text">C++</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Javascript} alt="javascript" />
        <div className="tech-icons-text">Javascript</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Typescript} alt="typescript" />
        <div className="tech-icons-text">Javascript</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Go} alt="go" />
        <div className="tech-icons-text">Go</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Node} alt="node" />
        <div className="tech-icons-text">Node.Js</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={ReactIcon} alt="react" />
        <div className="tech-icons-text">React.Js</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiSolidity fontSize={"24px"} />
        <div className="tech-icons-text">Solidity</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Mongo} alt="mongoDb" />
        <div className="tech-icons-text">Mongo DB</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Redux} alt="redux" />
        <div className="tech-icons-text">Redux</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <SiNextdotjs fontSize={"24px"} />
        <div className="tech-icons-text">Next.js</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Git} alt="git" />
        <div className="tech-icons-text">Git</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Firebase} alt="firebase" />
        <div className="tech-icons-text">Firebase</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Redis} alt="redis" />
        <div className="tech-icons-text">Redis</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Docker} alt="docker" />
        <div className="tech-icons-text">Docker</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Kubernates} alt="kubernetes" />
        <div className="tech-icons-text">Kubernetes</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <img src={SQL} alt="SQL" />
        <div className="tech-icons-text">Postgresql</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <img src={Python} alt="Python" />
        <div className="tech-icons-text">Python</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Java} alt="haskell" />
        <div className="tech-icons-text">Java</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={HaskellIcon} alt="haskell" />
        <div className="tech-icons-text">Haskell</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <img src={Tailwind} alt="tailwind" />
        <div className="tech-icons-text">Tailwind CSS</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <img src={MUI} alt="mui" />
        <div className="tech-icons-text">Material UI</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <img src={Postman} alt="Postman" />
        <div className="tech-icons-text">Postman</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <FaRust fontSize={"24px"} />
        <div className="tech-icons-text">Rust</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <img src={AWS} alt="Postman" className="tech-icon-images" />
        <div className="tech-icons-text">AWS</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <img src={Kafka} alt="Kafka" className="tech-icon-images" />
        <div className="tech-icons-text">Kafka</div>
      </Col>
    </Row>
  );
}

export default Techstack;
