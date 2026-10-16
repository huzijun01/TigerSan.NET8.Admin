INSERT INTO tigersan_web.company_mgt (name,addr,parent) VALUES
	 ('一级公司 1','地址 1-1',NULL),
	 ('二级公司 1','地址 2-1',1),
	 ('三级公司 1','地址 3-1',2),
	 ('一级公司 2','地址 1-2',NULL),
	 ('二级公司 2','地址 2-2',1),
	 ('三级公司 2','地址 3-2',5);

INSERT INTO tigersan_web.role_mgt (company,name) VALUES
	 (1,'角色 1-1'),
	 (4,'角色 1-2'),
	 (2,'角色 2-1'),
	 (5,'角色 2-2'),
	 (3,'角色 3-1'),
	 (6,'角色 3-2');

INSERT INTO tigersan_web.person_mgt (`role`,username,nickname,password,photo) VALUES
	 (1,'User_1-1-1','用户 1-1-1','',''),
	 (2,'User_1-2-1','用户 1-2-1','',''),
	 (3,'User_2-1-1','用户 2-1-1','',''),
	 (4,'User_2-2-1','用户 2-2-1','','');
