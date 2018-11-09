$(function(){
  var addTask = $('#submit'),
      deleteTask,
      detailTask,
      dbdetailTask,
      emptyTask = $('.empty'),
      taskList = [],
      taskDetail = $('.task-detail'),
      taskDetailMask = $('.task-detail-mask'),
      currentIndex,
      updateForm,
      finish;

  init();

  addTask.click(function(e){
    var newTask = {};
    e.preventDefault();
    newTask.content = $('#content').val();
    if(!newTask.content) return;
    if(add_task(newTask)){
      $('#content').val(null);
    }
  });

  function add_task(newTask){
    taskList.push(newTask);
    refresh_task();
    return true;
  }

  function listen_delete(){
    deleteTask.click(function(){
      var item = $(this).parent().parent();
      var index = item.data('index');
      var tmp = confirm("确定删除？");
      tmp ? delete_task(index) : null;
    })
  }

  function delete_task(index){
    if(index === undefined || !taskList[index]) return;
    delete taskList[index];
    refresh_task();
  }

  emptyTask.click(function(){
    var tmp = confirm("确定清空？");
    if(tmp){
      store.clear();
      taskList.splice(0,taskList.length);
      refresh_task();
    }else{
      return;
    }

  });

  function refresh_task(){
    store.set('taskList',taskList);
    new_task_list();
  }

  function listen_detail(){
    detailTask.click(function(){
      var item = $(this).parent().parent();
      var index = item.data('index');
      show_detail(index);
    });
    dbdetailTask.dblclick(function(){
      var index = $(this).data('index');
      show_detail(index);
    })
  }

  taskDetailMask.click(function(){
    hide_detail();
  });

  function show_detail(index){
    new_task_detail(index);
    currentIndex = index;
    taskDetail.show();
    taskDetailMask.show();
  }

  function update_detail(index,data){
    taskList[index] = $.extend({},taskList[index],data);
    refresh_task();
  }

  function hide_detail(){
    taskDetail.hide();
    taskDetailMask.hide();
  }

  function listen_checkbox(){
    finish.click(function(){
      var index = $(this).parent().parent().data('index');
      var item = get(index);
      if(item.finish){
        update_detail(index,{finish:false});
      }else{
        update_detail(index,{finish:true});
      }
    })
  }

  function get(index){
    return store.get('taskList')[index];
  }

  function init(){
    //showMsg();
    listen_msg();
    taskList = store.get('taskList') || [];
    if(taskList.length){
      new_task_list();
    }
    time();
  }

  function listen_msg(){
    $('.understand').click(function(){
      hideMsg();
      $('.audio').get(0).pause();
      })
  }

  function new_task_list(){
    var task_list =$('.task-list');
    task_list.html('');
    var finish_items=[];
    for(var i = 0; i < taskList.length; i++){
      var item = taskList[i];
      if(item && item.finish){
        finish_items[i]=item;
      }else{
        var task = task_tpl(item,i);
        task_list.prepend(task);
      }
    }
    for(var i=0;i < finish_items.length;i++){
      var item = finish_items[i];
      var $task = $(task_tpl(item,i));
      $task.addClass("over");
      task_list.append($task);
    }
    deleteTask = $('.delete');
    detailTask = $('.detail');
    dbdetailTask = $('.task-item');
    finish = $('.finish');
    listen_delete();
    listen_detail();
    listen_checkbox();
  }

  function time(){
    var currentTime;
    var cf =setInterval(function(){
      for(var i=0;i<taskList.length;i++){
        var item = get(i),taskTime;
        if(!item || !item.sj || item.informed) continue;
        currentTime = (new Date()).getTime();
        taskTime = (new Date(item.sj)).getTime();
        if(currentTime-taskTime>=1){
          update_detail(i,{informed:true});
          showMsg(item.content);
        }
      }
    },250);
  }


  function showMsg(msg){
    $('.msg-content').html(msg);
    $('.audio').get(0).play();
    $('.msg').show();
  }
  function hideMsg(){
    $('.msg').hide();
  }

  function new_task_detail(index){
    if(index === undefined || !taskList[index]) return;
    var item = taskList[index];
    var newDetail =
    '<form>' +
    '<div class="content">' +
    item.content  +
    '</div>' +
    '<div><input type="text" class="input1" value="'+(item.content || '')+'"></div>' +
    '<div>' +
      '<div class="desc">' +
        '<textarea name="desc" id="ddesc">'+ (item.desc || '') +'</textarea>' +
      '</div>' +
    '</div>' +
    '<div class="remind">' +
    '<label>提醒时间：</label>' +
      '<input class="date" type="text" value="'+ (item.sj ||'') +'"/>' +
    '</div>' +
    '<div><button type="submit" class="update">更新</button>' +
    '<button type="button" class="out">取消</button>' +
    '</div>' +
    '</form>';

    taskDetail.html(null);
    taskDetail.html(newDetail);
    $('.date').datetimepicker();
    //   $('.date').datetimepicker({
    //       timeFormat: "hh:mm tt"
    //   });
    updateForm = $('.update');
    $('.content').dblclick(function(){
      $('.input1').show();
      $(this).hide();
    });
    updateForm.click(function(e){
      e.preventDefault();
      var data = {};
      data.content = $('.input1').val();
      data.desc = $('#ddesc').val();
      data.sj = $('.date').val();
      update_detail(index,data);
      hide_detail();
    });
    $('.out').click(function(){
      hide_detail();
    })
  }

  function task_tpl(data,index){
    if(!data) return;
    var newList =
      '<div class="task-item" data-index="'+index+'">' +
      '<span><input type="checkbox" '+(data.finish?'checked':'') +' class="finish"/></span>' +
      '<span class="task-content">' + data.content + '</span>' +
      '<span class="fr">' +
      '<span class="action delete"> 删除</span>' +
      '<span class="action detail"> 详情</span>' +
      '</span>' +
      '</div>';
      return newList;
  }
});
