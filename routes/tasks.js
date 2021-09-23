var express = require('express');
const { Op } = require("sequelize");
var router = express.Router();

const { Task, List, User, sequelize }= require('../db/models')
const {asyncHandler, handleValidationErrors} = require("./utils");



const taskNotFoundError = (id) => {
  const err = Error(`Task with id of ${id} could not be found.`);
  err.title = "Task not found.";
  err.status = 404;
  return err;
};

router.get("/", asyncHandler(async (req, res) => {
    const tasks = await Task.findAll({
      include: [{
          model: List,
          where:{userId: res.locals.user.id},
        }]
        });
    res.render("tasks.pug")
  })
);

router.get("/task-list", asyncHandler(async (req, res) => {
  const tasks = await Task.findAll({
    include: [{
      model: List,
      where:{userId: res.locals.user.id},
    }]
  });
  res.json({ tasks });
})
);

router.get("/:id(\\d+)", asyncHandler(async (req, res, next) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await Task.findByPk(taskId);
    res.json({ task });
  })
);

router.patch("/:id(\\d+)", asyncHandler(async (req, res, next) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await Task.findByPk(taskId);

    if (task) {
      await task.update({ name: req.body.name });
      res.json({ task });
    } else {
      next(taskNotFoundError(taskId));
    }
  })
);


router.delete("/:id(\\d+)", asyncHandler(async (req, res, next) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await Task.findByPk(taskId);

    if (task) {
      await task.destroy();
      res.status(204).end();
    } else {
      next(taskNotFoundError(taskId));
    }
  })
);


router.get("/search/:searchTerm(\\w+)", asyncHandler(async (req, res) => {
   const searchTerm = req.params.searchTerm;
   const tasks = await Task.findAll({
     where: {
        name: {
          [Op.iLike]: `%${searchTerm}%`,
        }
    },
    include: [
      {
        model: List,
        where:{
          userId: res.locals.user.id
        }
      }
    ]
  });
  res.json({ tasks });
})
);

router.get("/list-list", asyncHandler(async (req, res) => {
  const lists = await List.findAll({
        where:{
          userId: res.locals.user.id
        }
      });
  res.json({ lists });
})
);


router.post("/add-list", asyncHandler(async (req, res) => {
  const {name} = req.body;
  const list =await List.create({
    name,
    userId: res.locals.user.id
  })
  res.status(201).redirect('/tasks')
}))

router.post("/", asyncHandler(async (req, res) => {
    const { name, listId} = req.body;
    const task = await Task.create({
      name,
      listId: res.locals.user.id
    });
    await task.save()
    res.status(201).redirect('/tasks')
  })
);


router.get("/search/:searchTerm(\\w+)", asyncHandler(async (req, res) => {
   const searchTerm = req.params.searchTerm;
   const tasks = await Task.findAll({
     where: {
        name: {
          [Op.iLike]: `%${searchTerm}%`,
        }
    },
    include: [
      {
        model: List,
        where:{
          userId: res.locals.user.id
        }
      }
    ]
  });
  res.json({ tasks });
})
);

router.post('/lists/delete/:id(\\d+)', asyncHandler(async (req, res) => {
    const bookId = parseInt(req.params.id, 10);
    const book = await db.Book.findByPk(bookId);

    checkPermissions(book, res.locals.user);

    await book.destroy();
    res.redirect('/');
  }));


module.exports = router;
