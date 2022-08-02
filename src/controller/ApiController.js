import UserModel from "../Schema/Schema.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import ExcelJs from "exceljs";

let data = {};
class RegController {
  static userRegistration = async (req, res) => {
    const {
      name,
      email,
      password,
      password_confirmation,
      tc,
      age,
      gender,
      address,
      mobile,
    } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({
        status: "Failed",
        message: "Email already exist!!! please try with another email id ",
      });
    } else {
      if (
        name &&
        email &&
        password &&
        password_confirmation &&
        tc &&
        age &&
        gender &&
        address &&
        mobile
      ) {
        if (password == password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
              age: age,
              gender: gender,
              address: address,
              mobile: mobile,
            });
            await doc.save();

            const saved_user = await UserModel.findOne({ email: email });
            //token generation
            const token = Jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: `5d` }
            );
            res.status(201).send({
              status: 201,
              message: "User Registration sucessfull",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.status(400).send({
              status: "Failed",
              message: "Unable to Register!! Enter Valid Details",
            });
          }
        } else {
          res.status(400).send({
            staus: "Failed",
            message: "Both field of Password Does not Match",
          });
        }
      } else {
        res.status(400).send({
          status: "Failed",
          message: "All fields are required",
        });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            const token = Jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: `5d` }
            );
            res.status(200).send({
              status: "Sucess",
              message: "login Sucessfull",
              token: token,
            });
          } else {
            res.status(400).send({
              status: "Failed",
              message: "Email and Password are not valid",
            });
          }
        } else {
          res
            .status(400)
            .send({ status: "Failed", message: "User is not Registered" });
        }
      } else {
        res
          .status(400)
          .send({ status: "Failed", message: "login Failed Bad Request" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ status: "Failed", message: "Unable to login" });
    }
  };
  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.status(400).send({
          status: "Failed",
          message: "New password and Confirm password does not match ",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newhashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newhashPassword },
        });
        res
          .status(200)
          .send({ status: "Sucess", message: "Password change Sucessfully" });
      }
    } else {
      res
        .status(400)
        .send({ status: "Failed", message: "All fields are required!!!" });
    }
  };
  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = Jwt.sign({ userID: user._id }, secret, {
          expiresIn: `15m`,
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        console.log(link);
        // send email
        let info = transporter.sendMail({
          form: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Account- Password reset link",
          html: ` Reset your password     ${link} `,
        });
        res.status(200).send({
          status: "Sucess",
          message: "Password reset email sent sucessfully",
          info: info,
        });
      } else {
        res
          .status(400)
          .send({ status: "Failed", message: "Email doest not exist" });
      }
    }
    if (!email) {
      res.status(400).send({ status: "Failed", message: "Email not found" });
    }
  };
  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      Jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res
            .status(400)
            .send({ status: "Failed", message: "Password does not match " });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newhashPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: newhashPassword },
          });
          res
            .status(200)
            .send({ status: "Sucess", message: "Password change Sucessfully" });
        }
      } else {
        res
          .status(400)
          .send({ status: "Failed", message: "All fields are required!!!" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ status: "Failed", message: "Bad Request" });
    }
  };
  static fetchAllData = async (req, res) => {
    UserModel.find((err, val) => {
      if (err) {
        res.status(400).send({
          status: "Failed to fetch",
          message: "Bad Request",
          data,
        });
      } else {
        res.json(val);
      }
    });
  };
  static deleteUser = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ email: email });
      const item = await UserModel.deleteOne(req.body);
      if (user.email !== email) {
        res.status(400).send({
          status: "Failed",
          message: "Unable to delete user!! Email not found",
        });
      } else {
        res.status(200).send({
          staus: "Sucess",
          message: "User deleted Sucessfully",
        });
      }
    } catch (error) {
      res.status(400).send({
        status: "Failed",
        message: "Unable to delete user!! Enter Valid email",
      });
    }
  };
  static updateExcel = async (req, res) => {
    var user = await UserModel.find();
    const workbook = new ExcelJs.Workbook();

    const worksheet = workbook.addWorksheet("My Users");
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },

      { header: "Email", key: "email", width: 30 },
      { header: "Terms", key: "tc", width: 30 },
      { header: "Age", key: "age", width: 30 },
      { header: "Gender", key: "gender", width: 30 },
      { header: "Address", key: "address", width: 30 },
      { header: "Mobile", key: "mobile", width: 30 },
    ];

    let count = 1;
    user.forEach((data) => {
      data.s_no = count;
      worksheet.addRow(data);

      count += 1;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    const data = workbook.xlsx
      .writeFile("excelsheet.xlsx")
      .then((result) => {
        res.status(200).json({
          msg: "Sheet laoded successfully",
          data: user,
        });
      })

      .catch((err) => {
        console.log(err);

        res.status(500).json({
          error: err,
        });
      });
  };
}
export default RegController;
