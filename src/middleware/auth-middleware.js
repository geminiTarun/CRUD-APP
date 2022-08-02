import jwt from "jsonwebtoken";
import UserModel from "../Schema/Schema.js";

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization) {
    try {
      token = authorization.split(` `)[1];
      //verify
      const { userID } = jwt.verify(token, process.env.JWt_SECRET_KEY);

      //get user
      req.user = await UserModel.findById(userID).select(`-password`);
      next();
    } catch (error) {
      res.status(401).send({ status: "failed", message: "unauthorized user" });
    }
    if (!token) {
      res
        .status(401)
        .send({ status: "failed", message: "unauthorized user, no token" });
    }
  }
  if (!token) {
    res
      .status(401)
      .send({ status: "failed", message: "unauthorized user, no token" });
  }
};
export default checkUserAuth;
